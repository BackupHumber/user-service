"use strict";
const elasticsearch = require("@elastic/elasticsearch");
const uuid = require('uuid/v1');
const debug = require("debug")("app:debug");
class ElasticRepository {
    constructor(type, appendSuffix = true) {
        if (!type) {
            throw new Error("Elasticsearch index must be defined");
        }
        this.client = new elasticsearch.Client({
            node: process.env.ELASTICSEARCH_URL
        });

        // this.baseIndex = `vas_${type}_${process.env.NODE_ENV}`;
        this.baseIndex = type;

        this.createIndex(type);
    }

    async createIndex(index) {
        try {
            let indices = await this.client.indices.exists({
                index
            });

            if (indices.statusCode == 404) {
                indices = await this.client.indices.create(
                    {
                        index
                    }
                )
            }
        } catch (e) {
            debug("CR", e);
        }
    }

    create(body) {
        return this.client.index({
            index: this.baseIndex,
            id: uuid(),
            body: body
        });
    }

    update(body) {
        return this.client.update({
            index: this.baseIndex,
            body: body
        });
    }

    async findOne(body){
        body.size = 1;
        let search = await this.client.search({
            index: this.baseIndex,
            body: body
        });
        return search.body.hits.hits[0] && search.body.hits.hits[0]._source || null;
    }
    async search(body) {
        try{
            let search = await this.client.search({
                index: this.baseIndex,
                body: body
            });

            // return search;
            if(body.size == 1)
                return  search &&  search.body &&  search.body.hits &&  search.body.hits.hits[0] &&  search.body.hits.hits[0]._source;

            return {
                total: search.body.hits.total && search.body.hits.total.value,
                aggregations: search.body.aggregations,
                data: search.body.hits.hits.map(res => {
                    return {
                        id: res._id,
                        ...res._source
                    }
                }),
            }
        }catch (e) {
            logger(e.message, new Error(e).stack,{
                query: body
            });
            return [];
        }
    }
    async count(body) {
        try{
            let count = await this.client.count({
                index: this.baseIndex,
                body: body
            });
            return count;
        }catch (e) {
            logger(e.message, new Error(e).stack,{
                query: body
            });
            return 0;
        }
    }
    deleteIndex(index){
        return this.client.indices.delete({
            index
        });
    }
    searchWithQuery(type, query = {}, from, size) {
        return this.client.search({
            index: this.baseIndex,
            type: type,
            body: {
                from,
                size,
                query: {
                    match: ""
                }
            }
        })
    }
    massInsert(body) {
        return this.client.bulk({
            // here we are forcing an index refresh,
            // otherwise we will not get any result
            // in the consequent search
            refresh: true,
            body: body
        })
    }

    async delete(type, id) {
        const res = await this.client.delete({
            index: this.baseIndex,
            id
        });
        return res.body.result == "deleted";
    }

    getIndex() {
        return this.baseIndex;
    }


    appendMultiplePropertyMatch(query) {
        //For conditions
        const tempArray = [];
        const keys = Object.keys(query);
        debug(keys);
        if (keys.length !== 0 && query.constructor === Object) {
            for (const key of keys) {
                tempArray.push({
                    match: {
                        [key]: query[key]
                    }
                })
            }
        }

        debug(tempArray);
        return tempArray;
    }

    appendTerms(key, terms = []) {
        /**
         * "terms" basically works like the WHERE IN query in SQL and NOSQL languages
         *
         * e.g
         * "terms": {
                		"productId": [ "5d3af86cfc8d8e5bf0a889bd", "5d383117b38013381b68d7cb" ]
             }
         */
        if (terms && terms.length > 0) {
            return {
                terms: {
                    [key]: terms
                }
            }
        }

        return null;
    }

    appendSort(key = "updatedAt", order = "desc", unmapped_type = "date"){
        return [
            {
                [key]: {
                    "order": order,
                    "unmapped_type":unmapped_type
                }
            }
        ]
    }


    appendSum(fieldName = "amount", field = "amount"){
        return {
            [fieldName]: {"sum": {"field": field}}
        };
    }
    appendDateRange(key,dateFrom, dateTo){
        /**
         * This will create a date range query for fetching the data
         */

        debug("Start Date", dateFrom, dateTo);
        if(dateFrom && dateTo){
            return {
                range: {
                    [key]: {
                        from: dateFrom,
                        to: dateTo
                    }
                }
            }
        }
    }

    appendDateQuery(key, query){
        /**
         * This will create a date range query for fetching the data
         */

        debug("query", query);
        return {
            range: {
                [key]: query
            }
        }
    }



    appendDateHistogram(body, field, interval = "day", includeSum = false, innerAggName = "amount", sumField = "amount",){

        body.aggs = {
            data_over_time: {
                date_histogram: {
                    field,
                    interval: interval || "day"
                }
            }
        };
        if (includeSum) {
            body.aggs.data_over_time.aggs = {
                [innerAggName]: {
                    sum: {
                        field: sumField
                    }
                }
            }
        }

        return body;
    }

    takeOnlyRecent(body, field, sortKey = "createdAt", sortType="desc" ){
        body.collapse = {
            field,
            "inner_hits": {
                "name": "most_recent",
                "size": 1,
                "sort": [{
                    [sortKey]: sortType
                }]
            }
        };
        return body;
    }
}

module.exports = ElasticRepository;
