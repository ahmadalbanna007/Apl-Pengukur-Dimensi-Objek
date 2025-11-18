let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");
let img = new Image();

let points = [];

document.getElementById("upload").onchange = function (e) {
    let reader = new FileReader();
    reader.onload = function (event) {
        img.onload = function () {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            points = [];
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(e.target.files[0]);
};

canvas.addEventListener("click", function (e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    points.push({ x, y });

    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fill();

    if (points.length === 4) {
        alert("4 titik sudah dipilih, klik tombol Hitung.");
    }
});

document.getElementById("measureBtn").onclick = function () {
    if (points.length < 4) {
        alert("Tandai 4 titik dulu!");
        return;
    }

    const refPx = distance(points[0], points[1]);
    const objPx = distance(points[2], points[3]);
    const refSize = parseFloat(document.getElementById("refSize").value);

    const scale = refSize / refPx;
    const objectSize = objPx * scale;

    document.getElementById("result").innerHTML =
        `Panjang objek = <b>${objectSize.toFixed(2)} mm</b>`;

    points = [];
};

function distance(p1, p2) {
    return Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
}
