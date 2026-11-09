# El Pistón — Cliente web (prototipo visual)

Interfaz web responsive para la gestión de un taller mecánico. Esta primera entrega contiene el diseño y una simulación funcional con datos de demostración; todavía no está conectada a PocketBase.

## Ejecutar

1. Descarga y descomprime el proyecto.
2. Abre la carpeta `el-piston-web`.
3. Abre `index.html` en el navegador. Para una experiencia más consistente, puedes usar la extensión **Live Server** de Visual Studio Code y seleccionar **Open with Live Server**.

No requiere instalación de dependencias ni compilación.

## Diseño

- Identidad visual naranja `#FF7A1A`, basada en la aplicación móvil.
- Tema claro y oscuro, con preferencia guardada en el navegador.
- Escritorio: navegación lateral y panel principal.
- Teléfono: navegación inferior y contenido adaptable.
- Tarjetas redondeadas, sombras suaves, indicadores de estado y alertas de inventario.

## Módulos incluidos

- Inicio: indicadores, órdenes recientes, alertas y carga de trabajo.
- Órdenes: listado, búsqueda, filtro por estado y creación de órdenes.
- Clientes: directorio y registro.
- Vehículos: tarjetas, registro y actualización de kilometraje.
- Inventario: existencias, stock mínimo y ajuste de unidades.
- Pagos: saldos pendientes, registro de abonos y movimientos.
- Reportes: resumen de facturación y gráficos de ejemplo.
- Configuración: tema y restablecimiento de datos de demostración.

## Datos y conexión futura

Los registros actuales son ficticios y se guardan en `localStorage` para que puedas probar la interfaz. No representan datos reales ni se comparten entre dispositivos.

En la siguiente etapa se sustituirá la capa de demostración de `js/app.js` por llamadas al SDK oficial de PocketBase. La estructura de pantallas está preparada para conectar las colecciones de clientes, vehículos, órdenes, mecánicos, repuestos y pagos.

## Estructura

```text
el-piston-web/
├── index.html
├── css/
│   └── styles.css
├── js/
│   └── app.js
├── assets/
└── README.md
```
