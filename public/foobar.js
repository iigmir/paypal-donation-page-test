const main_v1 = () => {
    document.querySelector("button[data-app='cret']").addEventListener("click", (ev) => {
        fetch("/api/order-create", {
            method: "POST"
        }).then( r => r.json() ).then( (r) => {
            show_json(r, "success");
        }).catch( (e) => {
            show_json(e, "error");
        });
    });
    document.querySelector("button[data-app='comp']").addEventListener("click", (ev) => {
        fetch("/api/order-complete", {
            method: "POST"
        }).then( r => r.json() ).then( (r) => {
            show_json(r, "success");
        }).catch( (e) => {
            show_json(e, "error");
        });
    });
};
