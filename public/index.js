const main = () => {
    const get_paypal_api = (client_id= "REPLACE_WITH_YOUR_CLIENT_ID") => {
        const paypal_sdk_url = "https://www.paypal.com/sdk/js";
        const currency = "USD";
        const intent = "capture";
        const venmo = "venmo";
        return `${paypal_sdk_url}?client-id=${client_id}&enable-funding=${venmo}&currency=${currency}&intent=${intent}`;
    };
    const url_to_head = (url) => {
        return new Promise(function(resolve, reject) {
            var script = document.createElement('script');
            script.src = url;
            script.onload = function() {
                resolve();
            };
            script.onerror = function() {
                reject('Error loading script.');
            };
            document.head.appendChild(script);
        });
    }
    const main_cb = () => {
        // Handle loading spinner
        // document.getElementById("loading").classList.add("hide");
        // document.getElementById("content").classList.remove("hide");
        // let alerts = document.getElementById("alerts");
        function show_success_msg(order_details, intent = "capture") {
            let intent_object = intent === "authorize" ? "authorizations" : "captures";
            return `Thank you ${order_details.payer.name.given_name} ${order_details.payer.name.surname} for your payment of ${order_details.purchase_units[0].payments[intent_object][0].amount.value} ${order_details.purchase_units[0].payments[intent_object][0].amount.currency_code}!`;
            // return `<div class="ms-alert ms-action">Thank you ${order_details.payer.name.given_name} ${order_details.payer.name.surname} for your payment of ${order_details.purchase_units[0].payments[intent_object][0].amount.value} ${order_details.purchase_units[0].payments[intent_object][0].amount.currency_code}!</div>`;
        }
        /**
         * Close out the PayPal buttons that were rendered
         * @param {*} paypal_buttons 
         */
        function close_up(paypal_buttons) {
            paypal_buttons.close();
            document.querySelector("#goodgood").removeAttribute("hidden");
        }
        const paypal_buttons = paypal.Buttons({
            onClick: (data) => {
                //Custom JS here
            },

            style: {
                shape: "sharp",
                color: "gold",
                layout: "horizontal",
                label: "pay"
            },

            createOrder: async function (data, actions) {
                const response = await fetch("/api/order-create", {
                    method: "post",
                    headers: { "Content-Type": "application/json; charset=utf-8" },
                    body: JSON.stringify({ "intent": "capture" })
                });
                const order = await response.json();
                return order.id;
            },

            onApprove: async function (data, actions) {
                try {
                    const intent = "capture";
                    const response = await fetch("api/order-complete", {
                        method: "post",
                        headers: { "Content-Type": "application/json; charset=utf-8" },
                        body: JSON.stringify({
                            "intent": intent,
                            "order_id": data.orderID
                        })
                    });
                    const order_details = await response.json();
                    console.log(order_details); //https://developer.paypal.com/docs/api/orders/v2/#orders_capture!c=201&path=create_time&t=response
                    Swal.fire({
                        title: "Thank you",
                        text: show_success_msg(order_details, intent),
                        icon: "success"
                    });
                    close_up(paypal_buttons);
                } catch (error) {
                    console.log(error);
                    Swal.fire({
                        title: "Order failed",
                        width: 1024,
                        icon: "error"
                    });
                }
            },

            onCancel: function (data) {
                Swal.fire({
                    title: "Order cancelled",
                    width: 1024,
                    icon: "info"
                });
            },
            
            onError: function (err) {
                console.log(err);
                Swal.fire({
                    title: "Order failed",
                    text: JSON.stringify(err),
                    width: 1024,
                    icon: "error",
                });
            }
        });
        paypal_buttons.render("#paypal-option");
    };
    fetch("/api/paypal-token").then(r=>r.json()).then( ({ client_id }) => {
        url_to_head( get_paypal_api(client_id) ).then(main_cb);
    });
};

main();

