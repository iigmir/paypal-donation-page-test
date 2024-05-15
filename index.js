import express from "express";
import "dotenv/config";

const app = express();
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));
const PORT = process.env.PORT || 3000;
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const ENVIRONMENT = process.env.ENVIRONMENT || 'sandbox';
const ENDPOINT_URL = ENVIRONMENT === "sandbox" ? "https://api-m.sandbox.paypal.com" : "https://api-m.paypal.com";

function get_access_token() {
    const auth = `${CLIENT_ID}:${CLIENT_SECRET}`;
    const data = 'grant_type=client_credentials';
    const api = `${ENDPOINT_URL}/v1/oauth2/token`;
    const params = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${Buffer.from(auth).toString("base64")}`
        },
        body: data
    };
    return fetch(api, params).then(res => res.json()).then(json => {
        return json.access_token;
    });
}

function get_order_create_api(req, token) {
    const api = `${ENDPOINT_URL}/v2/checkout/orders`;
    const params = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            "intent": req.body.intent.toUpperCase(),
            "purchase_units": [{
                "description": "Donate to Sam",
                "amount": {
                    "currency_code": "USD",
                    "value": "3.00"
                },
            }],
        })
    };
    return fetch(api, params).then(res => res.json());
}

function get_order_complete_api(req, token) {
    const api = `${ENDPOINT_URL}/v2/checkout/orders/${req.body.order_id}/${req.body.intent}`;
    const params = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            'Authorization': `Bearer ${token}`
        }
    };
    return fetch(api, params).then(res => res.json());
}

app.get("/api/paypal-token", (req, res) => {
    res.json({ client_id: process.env.CLIENT_ID });
});

app.post("/api/order-create", (req, res) => {
    get_access_token().then( (access_token) => {
        get_order_create_api(req, access_token).then(json => {
            res.send(json);
        });
    }).catch(err => {
        console.log(err);
        res.status(500).json(err);
    })
});

app.post("/api/order-complete", (req, res) => {
    get_access_token().then( (access_token) => {
        get_order_complete_api(req, access_token).then(json => {
            // console.log(json);
            res.send(json);
        }).catch(err => {
            console.log(err);
            res.status(500).json(err);
        });
    }).catch(err => {
        console.log(err);
        res.status(500).json(err);
    })
});

app.use(express.static("public"));

app.listen(PORT, () => {
    console.log(`Server listening at http://localhost:${PORT}`);
});



