import fetch from 'node-fetch';
import fs from 'fs';
import { createObjectCsvWriter } from 'csv-writer';
import { config } from 'dotenv';
import AWS from 'aws-sdk';

config();
// Defining important variables, endpoint and API_KEY
const API_KEY = process.env.API_KEY;
const api_url = "https://intranet.pbgroup.mx/api/1.1/obj/";

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

// Function to get data from bubble.io API and write it to a csv file
function JSONtoCsv(arrayOfJson, header, name, table) {
    // convert JSON to CSV
    const csvWriter = createObjectCsvWriter({
        path: `./${table}/${name}.csv`,
        header: header.map((h) => ({ id: h, title: h })),
        alwaysQuote: true
    }
    );
    csvWriter.writeRecords(arrayOfJson).then(function () {
        const fileContent = fs.readFileSync(`${table}/${name}.csv`);
        const params = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: `${table}/${name}.csv`,
            Body: fileContent
        };
        console.log(params)
        s3.upload(params, function (err, data) {
            if (err) {
                throw err;
            }
            console.log(`File uploaded successfully. ${data.Location}`);
        });
        console.log('The CSV file was written successfully')
    });
}

//Function to get the headers of each table
function getHeader(json) {
    // get header from json
    const header = [];
    for (const key in json[0]) {
        header.push(key);
    }
    return header;
}

// Function to initialize the process of getting data from the API for each table
async function show(url) {
    const tables = ["accesorioPBG", "Ajustes recomendaciones", "Ajustes de diseno", "alerta",
        "Apartado_botonesObj", "Apartado_forro", "ASN", "Apartado_tela", "Asesores", "Autorizaciones",
        "Botones", "Cambios_rollos", "cambiosMedidasOnline", "CaracteristicasModelo", "chaleco recomendacion",
        "Cita", "Cliente", "Comentarios_pedido", "Comentarios_prendas", "Complejidades", "Composturas", "Composturas solicitadas",
        "Repeticiones solicitadas", "comprobantes", "Folios", "Conglomerado_medidas", "Consumo_tela", "Consumo_habilitaciones",
        "consumo_modelo_habilitaciones", "consumos excedentes", "consumos_js", "ConsumoSastreria", "consumosEstimadosTipoPrenda",
        "Contactos", "Fit", "Cortes", "costosManufacturaExterno", "Cuento contable", "CxC Havoc", "CxC Morera Grosso", "cxcTB",
        "Datos de facturaci??n", "datos_medidas", "Defectos", "descargaAsn", "descripcionesHabilitaciones", "Descuento", "Detalle facturacion sartotia",
        "diasFeriados", "ediEnviado", "Eliminar_apartados", "eliminar_consumos", "Emails", "Compa??ia", "entradasSalidas_almacen",
        "EnvioPedidos", "equivalenciaModelo", "equivalencias", "equivalenciasShopifyBubble", "eqUpgradesTB", "Esquema de medidas",
        "estatusPedidos", "estatusPrendas", "Facturaci??n Sartor??a", "facturaTailoredBrands", "fechasPrenda", "Fieltros", "Filtros",
        "Fit TShirt", "Forros", "Fotograria de cliente", "Fotos Repetici??n", "fraccionArancelariaPBG", "fraccionesArancelarias",
        "FrontAccesorio", "frontAutorizacion", "FrontDiseno", "frontItem", "frontManofactura", "FrontMedidas", "frontModelo", "FrontOrden",
        "frontPedidos", "frontTestigos", "Habilitaciones_piezas", "Habilitaciones", "Hilos", "Historico FrontPedido", "Historico FrontPrenda",
        "hubs", "Intervalos de ajustes", "invoiceTB", "items", "itemTB", "jacquet recomendacion", "log disponibilidad inventarios", "logoHavoc",
        "logOrdenes", "logDisponibilidadTejido", "logsMasterbox", "logsMedicionesBorradas", "logsModelooRTW", "logsPedimentos", "logsPython",
        "logsRollos", "logsTejidos", "M??todos de pago", "Marca", "masterbox", "material", "Mediciones", "Movimientos", "Medidas", "medidas_calculadora",
        "Medidas Hockerty", "medidos_morfologicas", "Medidas Propercloth", "Medidas Propercloth", "Medidas su-servilleta", "MedidasAnatomicas",
        "medidasOnlineCliente", "MedidasOnlineModficadas", "medidasTestigo", "Modelos", "modelosRTW", "montoAccesorios", "montoPedido", "montoPrenda",
        "motivos_saldo_a_favor", "Movimiento_Consumo", "Mytable", "Napolli recomendaciones", "notas_credito", "Notificaciones", "nps", "npsComercial",
        "OrdenTB", "order", "Paginas", "Pagos", "pagos_anticipados", "pantallas", "Pausas Compostura", "pedido", "pedidoPdf", "pedidosLiverpool", "Pedimento",
        "permisos-Deprecated", "Personalizacion", "precios_sku", "Precios unitarios maquilla", "FrontPrenda", "Prendas", "PrendasEnProduccion", "Prendas Finanzas",
        "PrendaTB", "productos", "proveedor", "consultaDePruebas", "prueba_borras_2", "prueba_borrar", "machotes", "QRs", "price_points", "RangosPrendas", "rangoTestigos",
        "Recomendaciones", "refund", "reglaDefault", "reglasFecha", "relacionAjustesRubros", "relacionAjusteValores", "relacionHabilitacion", "Repeticiones",
        "reporteInventarioTb", "Repeticiones", "reporteInventarioTb", "revision", "Roles", "RollosTemporalesCompras", "Rollos", "RP", "rubroConsumo", "rubroInsumo",
        "rubros_airtable", "Rubros de Compostura", "RubrosDiseno", "rubrosManofactura", "rubrosMedidas", "RubrosMorfologicas", "saco recomendacion", "saldos_a_favor",
        "shipmentDocuments", "solicitudCambio", "Sorrento recomendaciones", "stackMedidas", "stores", "Subfolios", "temporalSubfoliosQR", "subfolios en produccion",
        "SubfoliosEquivocados", "subfoliosTempUpdateQrSartoria", "Sucursal", "sustituciones", "Sustituciones sartor??a", "TagOrden", "Tasks", "tax_options", "Tejido extra", "Tejidos",
        "Tejidos_temporal", "TejidosPalacio", "TejidoSolicitado", "Tel??fono", "temporal_pagos", "test", "Testigos", "tiemposMuertos", "personalizaci??nDise??o", "Tipo de Pu??o",
        "tipo_usuario", "insumoPrenda", "tiro recomendaciones", "traduccionesValoresTB", "Trasnferencia de clientes", "Urgencia", "Uso CFDI", "Valores Medidas Testigo",
        "valoresMedidaTestigoTB", "valorInsumoHabilitacion", "User"];
    tables.forEach(async (table) => {
        try {
            if (!fs.existsSync(table)) {
                fs.mkdirSync(table);
            }
        } catch (err) {
            console.error(err);
        }
        const response = await fetch(url + table, {
            method: "GET",
            withCredentials: true,
            headers: {
                "Authorization": `Bearer ${API_KEY}`,
                "Content-Type": "application/json"
            }
        });
        const json = await response.json();
        if (json && json.statusCode !== 404) {
            const values = json.response.results;
            const header = getHeader(values);
            const date = new Date(Date.now());
            const name = `${table}_${date.getFullYear()}_${date.getMonth() + 1}_${date.getDate()}`;
            JSONtoCsv(json.response.results, header, name, table);

        }
    });

}


//calling the function
show(api_url);