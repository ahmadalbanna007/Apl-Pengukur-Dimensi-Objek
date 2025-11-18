document.addEventListener('DOMContentLoaded', function() {
    const imageUpload = document.getElementById('imageUpload');
    const imageCanvas = document.getElementById('imageCanvas');
    const ctx = imageCanvas.getContext('2d');
    const resetBtn = document.getElementById('resetBtn');
    const point1Display = document.getElementById('point1');
    const point2Display = document.getElementById('point2');
    const measurementResult = document.getElementById('measurementResult');
    const imageInfo = document.getElementById('imageInfo');
    const scaleInput = document.getElementById('scaleInput');
    const convertedResult = document.getElementById('convertedResult');
    const calculationDetails = document.getElementById('calculationDetails');
    
    let image = null;
    let points = [];
    let scale = 1;
    
    // Event listener untuk upload gambar
    imageUpload.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(event) {
            image = new Image();
            image.onload = function() {
                // Atur ukuran canvas sesuai gambar
                imageCanvas.width = image.width;
                imageCanvas.height = image.height;
                
                // Gambar gambar ke canvas
                drawImage();
                
                // Tampilkan informasi gambar
                imageInfo.innerHTML = `
                    <div>Nama: ${file.name}</div>
                    <div>Dimensi: ${image.width} x ${image.height} piksel</div>
                    <div>Ukuran: ${(file.size / 1024).toFixed(2)} KB</div>
                `;
                
                // Reset titik
                resetPoints();
            };
            image.src = event.target.result;
        };
        reader.readAsDataURL(file);
    });
    
    // Event listener untuk klik pada canvas
    imageCanvas.addEventListener('click', function(e) {
        if (!image) {
            alert('Silakan unggah gambar terlebih dahulu!');
            return;
        }
        
        // Dapatkan koordinat relatif terhadap canvas
        const rect = imageCanvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Tambahkan titik
        points.push({x, y});
        
        // Update tampilan titik
        if (points.length === 1) {
            point1Display.textContent = `(${Math.round(x)}, ${Math.round(y)})`;
        } else if (points.length === 2) {
            point2Display.textContent = `(${Math.round(x)}, ${Math.round(y)})`;
            
            // Gambar ulang dengan titik dan garis
            drawImage();
            drawPointsAndLine();
            
            // Hitung jarak
            calculateDistance();
        }
        
        // Reset jika lebih dari 2 titik
        if (points.length > 2) {
            resetPoints();
            points.push({x, y});
            drawImage();
            drawPoint(x, y, 1);
            point1Display.textContent = `(${Math.round(x)}, ${Math.round(y)})`;
        } else if (points.length === 1) {
            // Gambar titik pertama
            drawPoint(x, y, 1);
        }
    });
    
    // Event listener untuk tombol reset
    resetBtn.addEventListener('click', function() {
        resetPoints();
        if (image) {
            drawImage();
        }
    });
    
    // Event listener untuk perubahan skala
    scaleInput.addEventListener('input', function() {
        scale = parseFloat(this.value) || 1;
        if (points.length === 2) {
            calculateDistance();
        }
    });
    
    // Fungsi untuk menggambar gambar ke canvas
    function drawImage() {
        ctx.drawImage(image, 0, 0);
    }
    
    // Fungsi untuk menggambar titik dengan label
    function drawPoint(x, y, pointNumber) {
        // Gambar lingkaran titik
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.fillStyle = 'red';
        ctx.fill();
        ctx.closePath();
        
        // Gambar border putih di sekitar titik
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.closePath();
        
        // Gambar label angka
        ctx.font = 'bold 14px Arial';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(pointNumber, x, y);
        
        // Simpan koordinat untuk referensi
        ctx.fillStyle = 'blue';
        ctx.font = '12px Arial';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(`Titik ${pointNumber} (${Math.round(x)}, ${Math.round(y)})`, x + 15, y - 15);
    }
    
    // Fungsi untuk menggambar garis antara titik
    function drawLine(point1, point2) {
        ctx.beginPath();
        ctx.moveTo(point1.x, point1.y);
        ctx.lineTo(point2.x, point2.y);
        ctx.strokeStyle = 'blue';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.closePath();
        
        // Tambahkan panah di ujung garis
        drawArrow(point1, point2);
        
        // Tambahkan teks jarak di tengah garis
        const midX = (point1.x + point2.x) / 2;
        const midY = (point1.y + point2.y) / 2;
        
        ctx.fillStyle = 'blue';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        
        const dx = point2.x - point1.x;
        const dy = point2.y - point1.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        ctx.fillText(`${distance.toFixed(2)} px`, midX, midY - 10);
        
        // Gambar proyeksi segitiga siku-siku
        drawTriangleProjection(point1, point2);
    }
    
    // Fungsi untuk menggambar panah
    function drawArrow(point1, point2) {
        const headLength = 15;
        const dx = point2.x - point1.x;
        const dy = point2.y - point1.y;
        const angle = Math.atan2(dy, dx);
        
        // Panah di titik 2
        ctx.beginPath();
        ctx.moveTo(point2.x, point2.y);
        ctx.lineTo(
            point2.x - headLength * Math.cos(angle - Math.PI / 6),
            point2.y - headLength * Math.sin(angle - Math.PI / 6)
        );
        ctx.moveTo(point2.x, point2.y);
        ctx.lineTo(
            point2.x - headLength * Math.cos(angle + Math.PI / 6),
            point2.y - headLength * Math.sin(angle + Math.PI / 6)
        );
        ctx.strokeStyle = 'blue';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.closePath();
        
        // Panah di titik 1 (hanya jika garis cukup panjang)
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance > headLength * 3) {
            ctx.beginPath();
            ctx.moveTo(point1.x, point1.y);
            ctx.lineTo(
                point1.x + headLength * Math.cos(angle - Math.PI / 6),
                point1.y + headLength * Math.sin(angle - Math.PI / 6)
            );
            ctx.moveTo(point1.x, point1.y);
            ctx.lineTo(
                point1.x + headLength * Math.cos(angle + Math.PI / 6),
                point1.y + headLength * Math.sin(angle + Math.PI / 6)
            );
            ctx.strokeStyle = 'blue';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.closePath();
        }
    }
    
    // Fungsi untuk menggambar proyeksi segitiga siku-siku
    function drawTriangleProjection(point1, point2) {
        const dx = point2.x - point1.x;
        const dy = point2.y - point1.y;
        
        // Gambar garis horizontal dari titik1
        ctx.beginPath();
        ctx.moveTo(point1.x, point1.y);
        ctx.lineTo(point2.x, point1.y);
        ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.closePath();
        
        // Gambar garis vertikal dari titik2
        ctx.beginPath();
        ctx.moveTo(point2.x, point1.y);
        ctx.lineTo(point2.x, point2.y);
        ctx.strokeStyle = 'rgba(0, 255, 0, 0.5)';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.closePath();
        
        // Kembalikan garis solid
        ctx.setLineDash([]);
        
        // Tandai panjang dx dan dy
        ctx.fillStyle = 'red';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`Δx = ${Math.abs(dx).toFixed(1)}`, (point1.x + point2.x) / 2, point1.y - 10);
        
        ctx.fillStyle = 'green';
        ctx.textAlign = 'left';
        ctx.fillText(`Δy = ${Math.abs(dy).toFixed(1)}`, point2.x + 10, (point1.y + point2.y) / 2);
    }
    
    // Fungsi untuk menggambar semua titik dan garis
    function drawPointsAndLine() {
        // Gambar garis antara titik
        if (points.length >= 2) {
            drawLine(points[0], points[1]);
        }
        
        // Gambar semua titik
        points.forEach((point, index) => {
            drawPoint(point.x, point.y, index + 1);
        });
    }
    
    // Fungsi untuk menghitung jarak
    function calculateDistance() {
        const dx = points[1].x - points[0].x;
        const dy = points[1].y - points[0].y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        measurementResult.textContent = `${distance.toFixed(2)} piksel`;
        convertedResult.textContent = `${(distance * scale).toFixed(2)} cm`;
        
        // Tampilkan detail perhitungan
        showCalculationDetails(dx, dy, distance);
    }
    
    // Fungsi untuk menampilkan detail perhitungan
    function showCalculationDetails(dx, dy, distance) {
        const absDx = Math.abs(dx);
        const absDy = Math.abs(dy);
        const dxSquared = dx * dx;
        const dySquared = dy * dy;
        const sumSquared = dxSquared + dySquared;
        
        calculationDetails.innerHTML = `
            <div class="calculation-step">
                <strong>Langkah 1:</strong> Hitung perbedaan koordinat
                <div class="calculation-formula">
                    Δx = x₂ - x₁ = ${points[1].x.toFixed(1)} - ${points[0].x.toFixed(1)} = ${dx.toFixed(2)} piksel<br>
                    Δy = y₂ - y₁ = ${points[1].y.toFixed(1)} - ${points[0].y.toFixed(1)} = ${dy.toFixed(2)} piksel
                </div>
            </div>
            
            <div class="calculation-step">
                <strong>Langkah 2:</strong> Kuadratkan masing-masing perbedaan
                <div class="calculation-formula">
                    (Δx)² = (${dx.toFixed(2)})² = ${dxSquared.toFixed(2)}<br>
                    (Δy)² = (${dy.toFixed(2)})² = ${dySquared.toFixed(2)}
                </div>
            </div>
            
            <div class="calculation-step">
                <strong>Langkah 3:</strong> Jumlahkan kuadrat perbedaan
                <div class="calculation-formula">
                    (Δx)² + (Δy)² = ${dxSquared.toFixed(2)} + ${dySquared.toFixed(2)} = ${sumSquared.toFixed(2)}
                </div>
            </div>
            
            <div class="calculation-step">
                <strong>Langkah 4:</strong> Ambil akar kuadrat dari hasil penjumlahan
                <div class="calculation-formula">
                    Jarak = √[(Δx)² + (Δy)²] = √[${sumSquared.toFixed(2)}] = ${distance.toFixed(2)} piksel
                </div>
            </div>
            
            <div class="calculation-step">
                <strong>Langkah 5:</strong> Konversi ke satuan centimeter (jika diperlukan)
                <div class="calculation-formula">
                    Jarak dalam cm = ${distance.toFixed(2)} piksel × ${scale} cm/piksel = ${(distance * scale).toFixed(2)} cm
                </div>
            </div>
            
            <div class="calculation-step">
                <strong>Rumus Teorema Pythagoras:</strong>
                <div class="calculation-formula">
                    d = √[(x₂ - x₁)² + (y₂ - y₁)²]
                </div>
            </div>
        `;
    }
    
    // Fungsi untuk mereset titik
    function resetPoints() {
        points = [];
        point1Display.textContent = 'Belum dipilih';
        point2Display.textContent = 'Belum dipilih';
        measurementResult.textContent = 'Belum ada pengukuran';
        convertedResult.textContent = '-';
        calculationDetails.innerHTML = '<p>Pilih dua titik untuk melihat detail perhitungan</p>';
    }
});