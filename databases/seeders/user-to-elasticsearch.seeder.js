"use strict";
const { Seeder }  =  require('mongoose-data-seed');


const authRepository = require("../../app/auths/AuthRepository");
const profileRepository = require("../../app/users/ProfileRepository");
const profileSearchRepository =  require("../../app/users/ProfileSearchRepository");
const profileService =  require("../../app/users/ProfileService");
const {ES_INDEX} = require("../../app/Constants");
class UserToElasticsearchSeeder extends Seeder {

  constructor(props) {
    super(props);
    console.log("constructor");

  }

  async shouldRun() {
    console.log("shouldRun");
      return true;
  }

  async run() {
    //connect to queue -  done
    //delete old index
    console.log("UserToElasticsearchSeeder Running.....");
    profileSearchRepository.deleteIndex(ES_INDEX.USERS)
        .then(console.log)
        .catch(console.log);
    //get auth data

    const profiles = await profileRepository.all();
    console.log("Total USER from DB", profiles.length);
    const formattedProfile = {};
    for(let profile of profiles){
      formattedProfile[profile._id.toString()] = profile.toJSON();
    }
    console.log("Formatted Profile", Object.keys(formattedProfile).length);
    const queuePayload = [];
    const auths = await authRepository.all();
    console.log("Total Auth from DB", auths.length);

    auths.forEach(auth => {
      const profile = formattedProfile[auth.userId] || {};
      // if(!profile) return;
      const meta = {...profile.meta};
      delete profile.meta;
      queuePayload.push({
        ...meta,
        ...auth.toJSON(),
        ...profile,
      })
    });
    console.log("Payload", queuePayload.length);

    const batchLength = 5000;
    while (queuePayload.length) {
      const data = queuePayload.splice(0, batchLength);
      await profileService.save(data);
      console.log("Left", queuePayload.length);
    }

    //get user data
    //format user and auth data and merge it
    //push in batch to elasticsearch runner queue
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve();
      }, 20000)
    })
  }

  async beforeRun() {
    return undefined;
  }
}

module.exports = UserToElasticsearchSeeder;
