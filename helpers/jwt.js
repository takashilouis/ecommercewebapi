const { expressjwt: jwt } = require('express-jwt')

function authJwt(){
    const secret = process.env.SECRET
    const api = process.env.API_URL
    console.log("secret: ", secret)
    console.log("api: ", api)

    return jwt({ 
        secret,
        algorithms: ['HS256'],
        //isRevoked: isRevoked
    }).unless({
        path: [
            {url: /\/public\/uploads(.*)/, methods: ['GET', 'OPTIONS'] },
            {url: /\/api\/v1\/categories(.*)/, methods: ['GET', 'OPTIONS'] },
            {url: /\/api\/v1\/orders(.*)/,methods: ['GET', 'OPTIONS', 'POST']},
            `${api}/users/login`,
            `${api}/users/register`,
            `/`,
            /^\/api-docs\/?(.*)/
        ]
    })
}

function isRevoked(req, payload, done) {
    console.log("JWT Payload:", payload);
    // if (!payload.isAdmin) {
    //     console.log("Revoked")
    //     return done(null, true); // Correctly exit after revocation
    // }
    // console.log("Not Revoked")
    done(null, false); // Explicitly allow the request, clarifying the intention
}

module.exports = authJwt