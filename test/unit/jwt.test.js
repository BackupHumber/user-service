"use strict";
// require("dotenv").config({});
const jwt = require("jsonwebtoken");

describe("JWT test", () => {
    it('should encode JWT', function () {
        const data = {foo: "bar"};
        const key = "bar";
        const token = jwt.sign({data},key, {
            algorithm: 'HS256',
            expiresIn: 60 * 60
        });
        expect(token).not.toBeUndefined();
        console.log("token", token);
    });

    it('should decode jwt', function () {
        const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdXRoIjp7InVzZXJJZCI6IjVlZGU5MTc2MGE3NWE2M2FiMzUwZjc3OSIsImNsaWVudElkIjoic3RhZ2luZ19lQ2NXdVBoZDc3QWt0Q3lfUnIyU0xsSVZJcVN1U0ozQktweXI4M2N4U09jcEUzdXhoam5yfjFBNmIycWt6dHNUS2NpNzFFSTIwfjdnM1RYaVc5N3h2VUg5UWEwZENrbjdqcHNaIiwicGhvbmVOdW1iZXIiOiIyMzQ2NzkwMTE3Mjg5IiwiY3JlYXRlZEF0IjoiMjAyMC0wNi0wOFQxOToyODo1NS4wNDJaIiwidXBkYXRlZEF0IjoiMjAyMC0wNi0wOFQxOToyODo1NS4wNDJaIiwiaWQiOiI1ZWRlOTE3NzBhNzVhNjNhYjM1MGY3N2EiLCJwcm9maWxlIjp7Im5hbWUiOiJUb2Z1bm1pIiwiY2xpZW50SWQiOiJzdGFnaW5nX2VDY1d1UGhkNzdBa3RDeV9ScjJTTGxJVklxU3VTSjNCS3B5cjgzY3hTT2NwRTN1eGhqbnJ-MUE2YjJxa3p0c1RLY2k3MUVJMjB-N2czVFhpVzk3eHZVSDlRYTBkQ2tuN2pwc1oiLCJtZXRhIjp7ImNsaWVudElkIjoic3RhZ2luZ19lQ2NXdVBoZDc3QWt0Q3lfUnIyU0xsSVZJcVN1U0ozQktweXI4M2N4U09jcEUzdXhoam5yfjFBNmIycWt6dHNUS2NpNzFFSTIwfjdnM1RYaVc5N3h2VUg5UWEwZENrbjdqcHNaIn0sImNyZWF0ZWRBdCI6IjIwMjAtMDYtMDhUMTk6Mjg6NTQuNTY4WiIsInVwZGF0ZWRBdCI6IjIwMjAtMDYtMDhUMTk6Mjg6NTQuNTY4WiIsImlkIjoiNWVkZTkxNzYwYTc1YTYzYWIzNTBmNzc5In19LCJ0eXBlIjoiYXV0aCIsImNsaWVudElkIjoic3RhZ2luZ19lQ2NXdVBoZDc3QWt0Q3lfUnIyU0xsSVZJcVN1U0ozQktweXI4M2N4U09jcEUzdXhoam5yfjFBNmIycWt6dHNUS2NpNzFFSTIwfjdnM1RYaVc5N3h2VUg5UWEwZENrbjdqcHNaIiwiYXV0aG9yaXNlZFNlcnZpY2UiOlsic3VwcG9ydC1zZXJ2aWNlIiwicGF5bWVudC1zZXJ2aWNlIl0sImlhdCI6MTU5MTY0NDUzNX0.4_akPKdzmFsK5a3-gn0R5Geakjwr0Q1L03Uts7B7inM";
        const signKey = "FXQyiK64DGr.YYYYSs0FjXjfzCIVU7egahxrM_~Hw-LXrHNqIXp3ghuSqsPrqE4NWW2Ksd-Y4bPIbKpm2QmVQ4_C3pt.5sTsbmma";
        const data = jwt.verify(token, signKey);
        expect(data).not.toBeUndefined();
        console.log("Data", data);
    });
});