let load;
document.getElementById('button').addEventListener('click', async event => {

    load = document.createElement("p");
    load.textContent = `Ahora busco y vuelvo, dame unos segunditos 👍( ͡▀̿ ̿ ͜ʖ ͡▀̿ ̿ 👍)`;
    load.style.fontWeight = 'bold';
    load.style.fontSize = "xx-large";

    document.body.appendChild(load);

    // 👍( ͡▀̿ ̿ ͜ʖ ͡▀̿ ̿ 👍)
    await loadImage();

});

async function sendData() {

    console.log('request');
    const prompt = 'userId';
    const api_url = `api`;
    const response = await fetch(api_url);
    const json = await response.json();


    // console.log(json.image);
    return json;
};

async function loadImage() {
    try {

        let data = await sendData();
        let images = data.image;
        let names = data.prompt;
        let items = Object.values(images);

        // let text = document.createElement("p");
        // text.textContent = `"${data.prompt}"`;
        // text.style.fontSize = "x-large";
        // document.body.appendChild(text);


        document.body.removeChild(load);
        items.forEach((n, index) => {

            const dash = document.createElement('hr');
            dash.style.borderTop = '1px dotted #2d572c';
            dash.style.borderBottom = '1px dotted #82E0AA';


            const number = document.createElement("p");
            number.textContent = `--> acá tenés: "${data.prompt}".`;
            number.style.fontWeight = 'bold';

            const img = document.createElement("img");
            img.style.display = 'flex';
            img.src = `data:image/png;base64, ${n.b64_json}`;
            // console.log(n.b64_json)

            const button = document.createElement("button");
            button.textContent = 'rescatar de la basura ♻️';
            button.addEventListener('click', async event => exportPNG(n.b64_json, `${names}-${index}.png`));

            document.body.append(dash, number, img, button);
        });
    } catch {
        let text = document.createElement("p");
        text.textContent = "con calma que solo podés buscar hasta 10 cosas por minuto...";
        text.style.fontSize = "xx-large";
        document.body.appendChild(text);

    };
};

async function exportPNG(data, name = `entre-la-basura.png`) {
    // console.log(data)
    // const response = await fetch(data);
    // const buffer = await response.buffer();
    // console.log(buffer)

    const base64Response = await fetch(`data:image/png;base64,${data}`);
    const blob_object = await base64Response.blob();


    // let url = await fetch(data);
    // let blob_object = await url.blob();

    let blob = await window.URL.createObjectURL(blob_object);
    const anchor = document.createElement('a');
    anchor.style.display = 'none';
    anchor.href = blob;
    anchor.download = name;
    document.body.appendChild(anchor);
    anchor.click();
    window.URL.revokeObjectURL(blob);
};