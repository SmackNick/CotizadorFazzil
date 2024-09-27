// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded and parsed');

    // Página de inicio
    const botonComenzar = document.getElementById('botonComenzar');
    if (botonComenzar) {
        botonComenzar.addEventListener('click', function() {
            window.location.href = 'infneg.html';
        });
    }

    // Página de información del negocio
    const formInfoNegocio = document.getElementById('formInfoNegocio');
    if (formInfoNegocio) {
        console.log('Found formInfoNegocio');
        formInfoNegocio.addEventListener('submit', function(e) {
            console.log('Form submitted');
        e.preventDefault();
        const nombreEmpresa = document.getElementById('nombreEmpresa').value;
        const nombreContacto = document.getElementById('nombreContacto').value;
        const contactoInfo = document.getElementById('contactoInfo').value;

        if (nombreEmpresa && nombreContacto && contactoInfo) {
            localStorage.setItem('nombreEmpresa', nombreEmpresa);
            localStorage.setItem('nombreContacto', nombreContacto);
            localStorage.setItem('contactoInfo', contactoInfo);
            console.log('Información del negocio guardada en localStorage');
            console.log('Intentando redirigir a detcotiz.html');
            window.location.href = 'detcotiz.html';
        } else {
            console.log('Campos requeridos están vacíos');
            alert('Por favor, completa todos los campos requeridos.');
        }
    });
        const logoInput = document.getElementById('subirLogo');
        if (logoInput) {
            logoInput.addEventListener('change', function(e) {
                const file = e.target.files[0];
                const reader = new FileReader();
                reader.onloadend = function() {
                    localStorage.setItem('logoDataUrl', reader.result);
                }
                reader.readAsDataURL(file);
            });
        }
    }

    // Página de detalles de la cotización
    const formDetallesCotizacion = document.getElementById('formDetallesCotizacion');
    if (formDetallesCotizacion) {
        const itemsCotizacion = document.getElementById('itemsCotizacion');
        const botonAgregarItem = document.getElementById('agregarItem');
        const totalCotizacion = document.getElementById('totalCotizacion');

        botonAgregarItem.addEventListener('click', function() {
            agregarItemCotizacion();
            actualizarTotal();
        });

        formDetallesCotizacion.addEventListener('submit', function(e) {
            e.preventDefault();
            if (validarFormulario()) {
                guardarDetallesCotizacion();
                window.location.href = 'vpcotiz.html';
            }
        });

        const incluirIVACheckbox = document.getElementById('incluirIVA');
        if (incluirIVACheckbox) {
            incluirIVACheckbox.addEventListener('change', actualizarTotal);
        }

        // Agregar el primer ítem por defecto
        agregarItemCotizacion();
        // Inicializar el total
        actualizarTotal();
    }

    // Página de vista previa de la cotización
    const vistaPreviaCotizacion = document.getElementById('vistaPreviaCotizacion');
    if (vistaPreviaCotizacion) {
        mostrarVistaPreviaCotizacion();
    }

    const botonDescargarPDF = document.getElementById('botonDescargarPDF');
    if (botonDescargarPDF) {
        botonDescargarPDF.addEventListener('click', generarPDF);
    }

    const botonDescargarImagen = document.getElementById('botonDescargarImagen');
    if (botonDescargarImagen) {
        botonDescargarImagen.addEventListener('click', generarImagen);
    }
});

function agregarItemCotizacion() {
    const itemsCotizacion = document.getElementById('itemsCotizacion');
    const nuevoItem = document.createElement('div');
    nuevoItem.className = 'item-cotizacion';
    nuevoItem.innerHTML = `
        <input type="text" name="descripcion[]" placeholder="Descripción del ítem" required>
        <input type="number" name="precio[]" placeholder="Precio" step="0.01" min="0" required>
        <button type="button" class="eliminar-item btn-secondary">Eliminar</button>
    `;
    itemsCotizacion.appendChild(nuevoItem);

    nuevoItem.querySelector('.eliminar-item').addEventListener('click', function() {
        itemsCotizacion.removeChild(nuevoItem);
        actualizarTotal();
    });

    // Add event listener to the new price input
    nuevoItem.querySelector('input[name="precio[]"]').addEventListener('input', actualizarTotal);
}

function actualizarTotal() {
    const precios = document.getElementsByName('precio[]');
    const incluirIVA = document.getElementById('incluirIVA').checked;
    let total = 0;

    for (let precio of precios) {
        const valor = parseFloat(precio.value);
        if (!isNaN(valor) && valor >= 0) {
            total += valor;
        }
    }

    if (incluirIVA) {
        total *= 1.19; // Add 19% IVA
    }

    document.getElementById('totalCotizacion').textContent = `Total: $${total.toFixed(2)}`;
}

function validarFormulario() {
    const descripciones = document.getElementsByName('descripcion[]');
    const precios = document.getElementsByName('precio[]');
    
    for (let i = 0; i < descripciones.length; i++) {
        if (descripciones[i].value.trim() === '') {
            alert('Por favor, ingrese una descripción para todos los ítems.');
            return false;
        }
        if (precios[i].value.trim() === '' || isNaN(parseFloat(precios[i].value)) || parseFloat(precios[i].value) < 0) {
            alert('Por favor, ingrese un precio válido para todos los ítems.');
            return false;
        }
    }
    return true;
}

function guardarDetallesCotizacion() {
    const items = [];
    const descripciones = document.getElementsByName('descripcion[]');
    const precios = document.getElementsByName('precio[]');
    const incluirIVA = document.getElementById('incluirIVA').checked;
    
    for (let i = 0; i < descripciones.length; i++) {
        items.push({
            descripcion: descripciones[i].value,
            precio: precios[i].value
        });
    }
    
    localStorage.setItem('itemsCotizacion', JSON.stringify(items));
    localStorage.setItem('incluirIVA', incluirIVA);
}

function mostrarVistaPreviaCotizacion() {
    const vistaPreviaCotizacion = document.getElementById('vistaPreviaCotizacion');
    const nombreNegocio = localStorage.getItem('nombreNegocio');
    const nombreContacto = localStorage.getItem('nombreContacto');
    const telefonoContacto = localStorage.getItem('telefonoContacto');
    const emailContacto = localStorage.getItem('emailContacto');
    const direccionEmpresa = localStorage.getItem('direccionEmpresa');
    const items = JSON.parse(localStorage.getItem('itemsCotizacion'));
    const incluirIVA = JSON.parse(localStorage.getItem('incluirIVA'));
    const logoDataUrl = localStorage.getItem('logoDataUrl');
    
    let html = '';
    
    if (logoDataUrl) {
        html += `<img src="${logoDataUrl}" alt="Logo" style="max-width: 150px; margin-bottom: 20px;"><br>`;
    }
    
    html += `<h2>${nombreNegocio}</h2>`;
    html += `<p>Contacto: ${nombreContacto}</p>`;
    if (telefonoContacto) html += `<p>Teléfono: ${telefonoContacto}</p>`;
    html += `<p>Email: ${emailContacto}</p>`;
    if (direccionEmpresa) html += `<p>Dirección: ${direccionEmpresa}</p>`;
    html += '<h3>Detalles de la Cotización:</h3>';
    html += '<table style="width: 100%; border-collapse: collapse;">';
    html += '<tr><th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Descripción</th><th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Precio</th></tr>';
    
    let subtotal = 0;
    for (let item of items) {
        html += `<tr><td style="border: 1px solid #ddd; padding: 8px;">${item.descripcion}</td><td style="border: 1px solid #ddd; padding: 8px; text-align: right;">$${parseFloat(item.precio).toFixed(2)}</td></tr>`;
        subtotal += parseFloat(item.precio);
    }
    
    html += '</table>';
    html += `<p style="text-align: right;"><strong>Subtotal: $${subtotal.toFixed(2)}</strong></p>`;
    
    if (incluirIVA) {
        const iva = subtotal * 0.19;
        const total = subtotal + iva;
        html += `<p style="text-align: right;">IVA (19%): $${iva.toFixed(2)}</p>`;
        html += `<p style="text-align: right;"><strong>Total (IVA incluido): $${total.toFixed(2)}</strong></p>`;
    } else {
        html += `<p style="text-align: right;"><strong>Total: $${subtotal.toFixed(2)}</strong></p>`;
        html += `<p style="text-align: right;">IVA no incluido</p>`;
    }
    
    vistaPreviaCotizacion.innerHTML = html;
}

function generarPDF() {
    console.log('Iniciando generación de PDF');
    const { jsPDF } = window.jspdf;
    if (!jsPDF) {
        console.error('jsPDF no está disponible');
        alert('Error al generar el PDF. Por favor, intente de nuevo.');
        return;
    }
    
    const doc = new jsPDF();
    
    const nombreEmpresa = localStorage.getItem('nombreEmpresa');
    const nombreContacto = localStorage.getItem('nombreContacto');
    const contactoInfo = localStorage.getItem('contactoInfo');
    const items = JSON.parse(localStorage.getItem('itemsCotizacion'));
    const incluirIVA = JSON.parse(localStorage.getItem('incluirIVA'));
    const logoDataUrl = localStorage.getItem('logoDataUrl');
    
    console.log('Datos recuperados:', { nombreEmpresa, nombreContacto, contactoInfo, items, incluirIVA, logoDataUrl });
    
    let yPos = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    
    if (logoDataUrl) {
        try {
            const imgProps = doc.getImageProperties(logoDataUrl);
            const imgWidth = 40;
            const imgHeight = imgWidth * imgProps.height / imgProps.width;
            doc.addImage(logoDataUrl, 'PNG', (pageWidth - imgWidth) / 2, yPos, imgWidth, imgHeight);
            yPos += imgHeight + 10;
        } catch (error) {
            console.error('Error al agregar el logo:', error);
        }
    }
    
    doc.setFontSize(16);
    doc.text(nombreEmpresa, pageWidth / 2, yPos, null, null, 'center');
    yPos += 10;
    
    doc.setFontSize(22);
    doc.text('Cotización', pageWidth / 2, yPos, null, null, 'center');
    yPos += 15;
    
    doc.setFontSize(12);
    doc.text(`Contacto: ${nombreContacto}`, 20, yPos);
    yPos += 10;
    doc.text(`Tel/Email: ${contactoInfo}`, 20, yPos);
    yPos += 15;
    
    yPos += 10;
    
    // Add table header
    doc.setFillColor(240, 240, 240);
    doc.rect(20, yPos, 170, 10, 'F');
    doc.setTextColor(0, 0, 0);
    doc.text('Descripción', 25, yPos + 7);
    doc.text('Precio', 160, yPos + 7);
    yPos += 15;
    
    let subtotal = 0;
    
    items.forEach((item, index) => {
        doc.text(item.descripcion, 25, yPos);
        doc.text(`$${parseFloat(item.precio).toFixed(2)}`, 160, yPos, null, null, 'right');
        yPos += 10;
        subtotal += parseFloat(item.precio);
        
        if ((index + 1) % 2 === 0) {
            doc.setFillColor(250, 250, 250);
            doc.rect(20, yPos - 10, 170, 10, 'F');
        }
    });
    
    yPos += 5;
    doc.line(20, yPos, 190, yPos);
    yPos += 10;
    
    doc.setFontSize(14);
    doc.text(`Subtotal: $${subtotal.toFixed(2)}`, 160, yPos, null, null, 'right');
    yPos += 10;
    
    if (incluirIVA) {
        const iva = subtotal * 0.19;
        const total = subtotal + iva;
        doc.text(`IVA (19%): $${iva.toFixed(2)}`, 160, yPos, null, null, 'right');
        yPos += 10;
        doc.setFontSize(16);
        doc.text(`Total (IVA incluido): $${total.toFixed(2)}`, 160, yPos, null, null, 'right');
    } else {
        doc.setFontSize(16);
        doc.text(`Total: $${subtotal.toFixed(2)}`, 160, yPos, null, null, 'right');
        yPos += 10;
        doc.setFontSize(12);
        doc.text('IVA no incluido', 160, yPos, null, null, 'right');
    }
    
    console.log('PDF generado, intentando guardar');
    try {
        doc.save('cotizacion.pdf');
        console.log('PDF guardado exitosamente');
    } catch (error) {
        console.error('Error al guardar el PDF:', error);
        alert('Error al guardar el PDF. Por favor, intente de nuevo.');
    }
}

function generarImagen() {
    const vistaPreviaCotizacion = document.getElementById('vistaPreviaCotizacion');
    const logoDataUrl = localStorage.getItem('logoDataUrl');
    
    if (logoDataUrl) {
        const logoImg = document.createElement('img');
        logoImg.src = logoDataUrl;
        logoImg.style.maxWidth = '100px';
        logoImg.style.marginBottom = '10px';
        vistaPreviaCotizacion.insertBefore(logoImg, vistaPreviaCotizacion.firstChild);
    }
    
    html2canvas(vistaPreviaCotizacion).then(function(canvas) {
        const link = document.createElement('a');
        link.download = 'cotizacion.png';
        link.href = canvas.toDataURL();
        link.click();
        
        if (logoDataUrl) {
            vistaPreviaCotizacion.removeChild(vistaPreviaCotizacion.firstChild);
        }
    });
}