const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];

const demo = {
  clients:[
    {id:1,name:"Carlos Méndez",phone:"555-0182",address:"Calle 12, Centro"},
    {id:2,name:"María González",phone:"555-0134",address:"Av. Libertad 45"},
    {id:3,name:"Jorge Pérez",phone:"555-0198",address:"Reparto Norte"},
    {id:4,name:"Ana Rodríguez",phone:"555-0167",address:"Calle 8, Vista Alegre"},
    {id:5,name:"Luis Herrera",phone:"555-0122",address:"Zona Industrial"}
  ],
  vehicles:[
    {id:1,plate:"P-48291",brand:"Toyota",model:"Corolla",year:2018,km:82400,client:1},
    {id:2,plate:"P-19382",brand:"Hyundai",model:"Accent",year:2020,km:51300,client:2},
    {id:3,plate:"P-82731",brand:"Kia",model:"Rio",year:2017,km:96700,client:3},
    {id:4,plate:"P-65218",brand:"Honda",model:"Civic",year:2021,km:42600,client:4},
    {id:5,plate:"P-31094",brand:"Chevrolet",model:"Spark",year:2016,km:112300,client:1},
    {id:6,plate:"P-90442",brand:"Nissan",model:"Sentra",year:2019,km:73800,client:5}
  ],
  mechanics:[
    {name:"Miguel Torres",initials:"MT"},
    {name:"Daniel Cruz",initials:"DC"}
  ],
  orders:[
    {id:1042,vehicle:1,client:1,mechanic:"Miguel Torres",problem:"Cambio de aceite y filtro",status:"En reparación",date:"08/11/2026"},
    {id:1041,vehicle:2,client:2,mechanic:"Daniel Cruz",problem:"Revisión del sistema de frenos",status:"En diagnóstico",date:"08/11/2026"},
    {id:1040,vehicle:3,client:3,mechanic:"Miguel Torres",problem:"Ruido en la suspensión delantera",status:"Recibida",date:"07/11/2026"},
    {id:1039,vehicle:4,client:4,mechanic:"Daniel Cruz",problem:"Alineación y balanceo",status:"Lista para entregar",date:"07/11/2026"},
    {id:1038,vehicle:5,client:1,mechanic:"Miguel Torres",problem:"Cambio de batería",status:"Entregada",date:"06/11/2026"},
    {id:1037,vehicle:6,client:5,mechanic:"Daniel Cruz",problem:"Mantenimiento general",status:"En reparación",date:"05/11/2026"}
  ],
  parts:[
    {id:1,name:"Filtro de aceite",code:"FIL-001",price:12,stock:3,min:5},
    {id:2,name:"Pastillas de freno",code:"FRE-014",price:38,stock:2,min:4},
    {id:3,name:"Aceite 10W-40",code:"LUB-010",price:29,stock:4,min:5},
    {id:4,name:"Bujía estándar",code:"ENC-003",price:8,stock:18,min:6},
    {id:5,name:"Filtro de aire",code:"FIL-002",price:16,stock:12,min:4},
    {id:6,name:"Batería 12V",code:"ELE-008",price:95,stock:7,min:2},
    {id:7,name:"Líquido de frenos",code:"FRE-020",price:11,stock:9,min:3}
  ],
  balances:[
    {client:1,order:1035,total:280,paid:180},
    {client:2,order:1036,total:190,paid:100},
    {client:3,order:1032,total:145,paid:75},
    {client:5,order:1030,total:320,paid:240}
  ],
  payments:[
    {client:4,order:1039,date:"08/11/2026",method:"Efectivo",amount:120},
    {client:1,order:1038,date:"07/11/2026",method:"Transferencia",amount:95},
    {client:2,order:1036,date:"06/11/2026",method:"Efectivo",amount:100},
    {client:3,order:1032,date:"05/11/2026",method:"Tarjeta",amount:75}
  ]
};

let data = {
  clients: [],
  vehicles: [],
  mechanics: [],
  orders: [],
  parts: [],
  balances: [],
  payments: []
};
let currentPage = "inicio";
let modalType = "";
let selectedOrderId = null;
let toastTimer;

function loadData(){
  try{
    return JSON.parse(localStorage.getItem("elpiston-demo"))||structuredClone(demo);
  }catch{
    return structuredClone(demo);
  }
}

function saveData(){
  localStorage.setItem("elpiston-demo",JSON.stringify(data));
}

function money(n){
  return "$"+Number(n||0).toLocaleString("en-US",{maximumFractionDigits:2});
}

function client(id){
  return data.clients.find(x=>String(x.id)===String(id))||{
    name:"Cliente eliminado",
    phone:"",
    address:""
  };
}

function vehicle(id){
  return data.vehicles.find(x=>String(x.id)===String(id))||{
    plate:"—",
    brand:"",
    model:"",
    year:"",
    km:0,
    client:null
  };
}

function initials(name=""){
  return String(name).split(" ").slice(0,2).map(x=>x[0]||"").join("").toUpperCase();
}

function statusClass(s){
  return ({
    "Recibida":"status-recibida",
    "En diagnóstico":"status-diagnostico",
    "En reparación":"status-reparacion",
    "Lista para entregar":"status-lista",
    "Entregada":"status-entregada",
    "Cancelada":"status-cancelada"
  })[s]||"status-recibida";
}

function statusBadge(s){
  return `<span class="status ${statusClass(s)}">${s||"Sin estado"}</span>`;
}

function showToast(message){
  const el=$("#toast");
  if(!el)return;
  el.textContent=message;
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>el.classList.remove("show"),2600);
}

async function cargarDatosPocketBase() {
  if (!window.AuthAPI?.isAuthenticated()) return;

  try {
    const [clients, vehicles, orders, parts, mechanics] = await Promise.all([
      ClientesAPI.listar(),
      VehiculosAPI.listar(),
      OrdenesAPI.listar(),
      InventarioAPI.listar(),
      ElPiston.pb.collection("users").getFullList({
        filter: 'rol = "mecanico"',
        sort: "nombre"
      })
    ]);

    data.clients = clients;
    data.vehicles = vehicles;
    data.parts = parts;

    data.mechanics = mechanics.map(m => ({
      id: m.id,
      name: m.nombre || m.email,
      initials: initials(m.nombre || m.email)
    }));

    data.orders = orders.map(o => {
      const mechanic = mechanics.find(m => m.id === o.mechanicId);

      return {
        ...o,
        mechanic: mechanic?.nombre || mechanic?.email || o.mechanic || "Sin asignar"
      };
    });

    data.balances = [];
    data.payments = [];

    if (AuthAPI.hasRole("dueno", "recepcionista")) {
      const [payments, jobs, usedParts] = await Promise.all([
        PagosAPI.listar(),
        ElPiston.pb.collection("trabajos").getFullList(),
        ElPiston.pb.collection("repuestos_usados").getFullList()
      ]);

      const totals = new Map();
      const paid = new Map();

      data.orders.forEach(o => totals.set(String(o.id), 0));

      jobs.forEach(job => {
        const id = String(job.orden);
        totals.set(
          id,
          (totals.get(id) || 0) + Number(job.precio_mano_obra || 0)
        );
      });

      usedParts.forEach(item => {
        const id = String(item.orden);
        const amount = Number(item.cantidad || 0) * Number(item.precio_unitario || 0);

        totals.set(id, (totals.get(id) || 0) + amount);
      });

      payments.forEach(payment => {
        const id = String(payment.order);
        paid.set(id, (paid.get(id) || 0) + payment.amount);
      });

      const ordersById = new Map(
        data.orders.map(o => [String(o.id), o])
      );

      data.balances = data.orders
        .map(o => {
          const id = String(o.id);
          const total = totals.get(id) || 0;
          const amountPaid = paid.get(id) || 0;

          return {
            client: o.client,
            clientName: o.clientName || client(o.client).name,
            order: o.id,
            total,
            paid: amountPaid
          };
        })
        .filter(b => b.total > b.paid);

      data.payments = payments
        .filter(p => ordersById.has(String(p.order)))
        .map(p => {
          const order = ordersById.get(String(p.order));

          return {
            ...p,
            client: order.client,
            clientName: order.clientName || client(order.client).name,
            date: p.date
              ? new Date(p.date).toLocaleDateString("es-ES")
              : "",
            method: ({
              efectivo: "Efectivo",
              transferencia: "Transferencia",
              tarjeta: "Tarjeta"
            })[p.method] || p.method
          };
        });
    }

    renderDashboard();
    renderOrders();
    renderClients();
    renderVehicles();
    renderParts();
    renderPayments();
    renderReports();

  } catch (error) {
    console.error("Error cargando datos:", error);
    console.error("Detalles:", JSON.stringify(error.response?.data, null, 2));
    showToast(ElPiston.errorMessage(error));
  }
}

function navigate(page){
  currentPage=page;

  $$(".page").forEach(p=>p.classList.toggle("active",p.id===`page-${page}`));
  $$("[data-page]").forEach(b=>b.classList.toggle("active",b.dataset.page===page));

  $("#crumb").textContent=({
    inicio:"Inicio",
    ordenes:"Órdenes de servicio",
    clientes:"Clientes",
    vehiculos:"Vehículos",
    inventario:"Inventario",
    pagos:"Pagos y saldos",
    reportes:"Reportes",
    perfil:"Configuración"
  })[page];

  renderPage(page);
  window.scrollTo({top:0,behavior:"smooth"});
}

function renderPage(page){
  ({
    inicio:renderDashboard,
    ordenes:renderOrders,
    clientes:renderClients,
    vehiculos:renderVehicles,
    inventario:renderParts,
    pagos:renderPayments,
    reportes:renderReports,
    perfil:()=>{}
  })[page]?.();
}

function renderDashboard(){
  const open=data.orders.filter(o=>!["Entregada","Cancelada"].includes(o.status));

  $("#statOpen").textContent=open.length;
  $("#statCars").textContent=open.length;

  $("#recentOrders").innerHTML=data.orders.slice(0,5).map(o=>{
   const v=o.vehicleInfo||vehicle(o.vehicle);

    return `<tr>
      <td>
        <div class="vehicle-cell">
          <div class="vehicle-thumb">🚘</div>
          <div>
            <strong>${v.brand} ${v.model}</strong>
            <span>${v.plate}</span>
          </div>
        </div>
      </td>
      <td class="customer-name">${o.clientName||client(o.client).name}</td>
      <td>${o.mechanic||"Sin asignar"}</td>
      <td>${statusBadge(o.status)}</td>
      <td>${o.date||""}</td>
    </tr>`;
  }).join("");

  const low=data.parts.filter(p=>p.stock<=p.min);

  $("#alertCounter").textContent=low.length;

  $("#dashboardAlerts").innerHTML=low.length
    ?low.slice(0,4).map(p=>`<div class="alert-item">
        <div class="alert-symbol">!</div>
        <div>
          <strong>${p.name}</strong>
          <span>${p.stock} unidades disponibles · Mínimo ${p.min}</span>
        </div>
      </div>`).join("")
    :`<p class="muted-small">No hay alertas de inventario.</p>`;

  $("#workload").innerHTML=data.mechanics.map(m=>{
    const n=open.filter(o=>
      String(o.mechanicId||"")===String(m.id||"")||
      o.mechanic===m.name
    ).length;

    return `<div class="workload-item">
      <div class="mechanic-avatar">${initials(m.name)}</div>
      <div class="workload-info">
        <strong>${m.name}</strong>
        <span>${n} órdenes activas</span>
      </div>
      <strong class="workload-number">${n}</strong>
      <div class="workload-track">
        <i style="width:${Math.min(100,n/6*100)}%"></i>
      </div>
    </div>`;
  }).join("");
}

function renderOrders(){
  const q=($("#orderSearch")?.value||"").toLowerCase();
  const f=$("#orderFilter")?.value||"Todas";

  const rows=data.orders.filter(o=>{
    const v=o.vehicleInfo||vehicle(o.vehicle);
    const c=client(o.client);
    const text=`${o.id} ${v.plate} ${v.brand} ${v.model} ${c.name} ${o.problem||""}`.toLowerCase();

    return text.includes(q)&&(f==="Todas"||o.status===f);
  });

  $("#ordersTable").innerHTML=rows.map(o=>{
    const v=vehicle(o.vehicle);

    return `<tr>
      <td><strong>#${o.id}</strong></td>
      <td>
        <div class="vehicle-cell">
          <div class="vehicle-thumb">🚘</div>
          <div>
            <strong>${v.brand} ${v.model}</strong>
            <span>${v.plate}</span>
          </div>
        </div>
      </td>
      <td class="customer-name">${o.clientName||client(o.client).name}</td>
      <td>${o.mechanic||"Sin asignar"}</td>
      <td>${statusBadge(o.status)}</td>
      <td>${o.date||""}</td>
      <td>
        <div class="order-actions">
          <button class="row-action" data-action="order" data-id="${o.id}" title="Cambiar estado">↻</button>
          <button class="row-action" data-action="order-parts" data-id="${o.id}" title="Gestionar repuestos">⚙</button>
        </div>
      </td>
    </tr>`;
  }).join("")||`<tr><td colspan="7">No se encontraron órdenes.</td></tr>`;

  $("#ordersCount").textContent=`Mostrando ${rows.length} de ${data.orders.length} órdenes`;
}

function renderClients(){
  const q=($("#clientSearch")?.value||"").toLowerCase();

  const rows=data.clients.filter(c=>
    `${c.name} ${c.phone} ${c.address}`.toLowerCase().includes(q)
  );

  $("#clientsTable").innerHTML=rows.map(c=>`<tr>
    <td>
      <div class="vehicle-cell">
        <div class="avatar">${initials(c.name)}</div>
        <div>
          <strong>${c.name}</strong>
          <span>Cliente</span>
        </div>
      </div>
    </td>
    <td>${c.phone}</td>
    <td>${c.address||"—"}</td>
    <td>${data.vehicles.filter(v=>String(v.client)===String(c.id)).length}</td>
    <td>${data.orders.filter(o=>String(o.client)===String(c.id)).length}</td>
    <td><button class="row-action" data-action="client" data-id="${c.id}">⋯</button></td>
  </tr>`).join("")||`<tr><td colspan="6">No se encontraron clientes.</td></tr>`;

  $("#clientCount").textContent=`${rows.length} clientes`;
}

function renderVehicles(){
  const q=($("#vehicleSearch")?.value||"").toLowerCase();

  const rows=data.vehicles.filter(v=>
    `${v.plate} ${v.brand} ${v.model} ${client(v.client).name}`.toLowerCase().includes(q)
  );

  $("#vehiclesGrid").innerHTML=rows.map(v=>`<article class="vehicle-card">
    <div class="vehicle-card-top">
      <span class="plate">${v.plate}</span>
      <button class="row-action" data-action="vehicle" data-id="${v.id}">⋯</button>
    </div>
    <div class="car-illustration">🚘</div>
    <h3>${v.brand} ${v.model}</h3>
    <p>${client(v.client).name}</p>
    <div class="vehicle-meta">
      <span>Año ${v.year}</span>
      <span>${Number(v.km).toLocaleString("en-US")} km</span>
    </div>
  </article>`).join("")||`<div class="panel">No se encontraron vehículos.</div>`;
}

function renderParts(){
  const q=($("#partSearch")?.value||"").toLowerCase();
  const f=$("#partFilter")?.value||"todos";
  const low=data.parts.filter(p=>p.stock<=p.min);

  const rows=data.parts.filter(p=>
    `${p.name} ${p.code}`.toLowerCase().includes(q)&&
    (f==="todos"||p.stock<=p.min)
  );

  $("#partsTable").innerHTML=rows.map(p=>`<tr>
    <td>
      <div class="vehicle-cell">
        <div class="vehicle-thumb">⚙</div>
        <div>
          <strong>${p.name}</strong>
          <span>Repuesto</span>
        </div>
      </div>
    </td>
    <td>${p.code}</td>
    <td class="customer-name">${money(p.price)}</td>
    <td><span class="stock-number ${p.stock<=p.min?"low":""}">${p.stock} uds.</span></td>
    <td><span class="stock-label ${p.stock<=p.min?"low":""}">${p.stock<=p.min?"Stock bajo":"Disponible"}</span></td>
    <td><button class="row-action" data-action="part" data-id="${p.id}">⋯</button></td>
  </tr>`).join("")||`<tr><td colspan="6">No se encontraron repuestos.</td></tr>`;

  $("#partTotal").textContent=data.parts.length;
  $("#partLow").textContent=low.length;
  $("#partValue").textContent=money(data.parts.reduce((s,p)=>s+p.price*p.stock,0));
}

function renderPayments() {
  const now = new Date();

  const monthlyPayments = data.payments.filter(p => {
    const date = new Date(p.date);

    return !Number.isNaN(date.getTime()) &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();
  });

  const income = monthlyPayments.reduce((sum, p) => sum + p.amount, 0);

  const due = data.balances.reduce(
    (sum, b) => sum + b.total - b.paid,
    0
  );

  const clientsWithBalance = new Set(
    data.balances.map(b => String(b.client || b.clientName))
  );

  const partialOrders = data.balances.filter(
    b => b.paid > 0 && b.paid < b.total
  ).length;

  const settledOrders = data.orders.filter(o => {
    const balance = data.balances.find(
      b => String(b.order) === String(o.id)
    );

    const total = balance?.total || 0;
    const paid = balance?.paid || 0;

    return total > 0 && paid >= total;
  }).length;

  $("#paymentIncome").textContent = money(income);
  $("#paymentDue").textContent = money(due);
  $("#paymentClients").textContent = `De ${clientsWithBalance.size} clientes`;
  $("#paymentPartial").textContent = partialOrders;
  $("#paymentSettled").textContent = settledOrders;

  $("#balancesTable").innerHTML = data.balances.map(b => `
    <tr>
      <td class="customer-name">${b.clientName || client(b.client).name}</td>
      <td>#${b.order}</td>
      <td>${money(b.total)}</td>
      <td>${money(b.paid)}</td>
      <td class="balance">${money(b.total - b.paid)}</td>
      <td>
        <button class="row-action" data-action="balance" data-id="${b.order}">＋</button>
      </td>
    </tr>
  `).join("") || `
    <tr><td colspan="6">No hay saldos pendientes.</td></tr>
  `;

  $("#paymentsTable").innerHTML = data.payments.map(p => `
    <tr>
      <td class="customer-name">${p.clientName || "Cliente no disponible"}</td>
      <td>#${p.order}</td>
      <td>${p.date}</td>
      <td>${p.method}</td>
      <td class="customer-name">${money(p.amount)}</td>
    </tr>
  `).join("") || `
    <tr><td colspan="5">Todavía no hay pagos registrados.</td></tr>
  `;
}


function renderReports(){
  $("#reportMechanics").innerHTML=data.mechanics.map(m=>{
    const n=data.orders.filter(o=>
      String(o.mechanicId||"")===String(m.id||"")||
      o.mechanic===m.name
    ).length;

    const percentage=data.orders.length?n/data.orders.length*100:0;

    return `<div class="mechanic-report-row">
      <strong>${m.name}</strong>
      <div class="report-track"><i style="width:${percentage}%"></i></div>
      <b>${n} órdenes</b>
    </div>`;
  }).join("");
}

const field=(label,name,placeholder="",type="text",full=false,options=null)=>
  `<div class="field ${full?"full-field":""}">
    <label>${label}</label>
    ${options
      ?`<select name="${name}" required>${options.map(o=>`<option value="${o.value}">${o.label}</option>`).join("")}</select>`
      :type==="textarea"
        ?`<textarea name="${name}" placeholder="${placeholder}" required></textarea>`
        :`<input name="${name}" type="${type}" placeholder="${placeholder}" ${type==="number"?'min="0"':''} required>`
    }
  </div>`;

function openModal(type,record=null){
  modalType=type;

  let title="";
  let fields="";

  const submitButton=$('#modalForm button[type="submit"]');

  if(submitButton){
    submitButton.hidden=type==="orderParts";
    submitButton.textContent="Guardar registro";
  }

  if(type==="client"){
    title="Nuevo cliente";
    fields=field("Nombre completo","name","Ej. Carlos Méndez")
      +field("Teléfono","phone","555-0100","tel")
      +field("Dirección","address","Dirección (opcional)","text",true);
  }

  if(type==="vehicle"){
    title="Nuevo vehículo";
    fields=field("Matrícula","plate","P-12345")
      +field("Marca","brand","Toyota")
      +field("Modelo","model","Corolla")
      +field("Año","year","2022","number")
      +field("Kilometraje","km","50000","number")
      +field("Propietario","client","","text",true,data.clients.map(c=>({
        value:c.id,
        label:c.name
      })));
  }

  if(type==="order"){
    title="Nueva orden de servicio";

    fields=field("Vehículo","vehicle","","text",true,data.vehicles.map(v=>({
      value:v.id,
      label:`${v.plate} · ${v.brand} ${v.model}`
    })))
      +field("Mecánico asignado","mechanicId","","text",false,data.mechanics.map(m=>({
        value:m.id,
        label:m.name
      })))
      +field("Problema reportado","problem","Describe el problema del vehículo","textarea",true)
      +field("Estado inicial","status","","text",false,[
        "Recibida",
        "En diagnóstico",
        "En reparación"
      ].map(x=>({value:x,label:x})));
  }

  if(type==="orderStatus"){
    selectedOrderId=record.id;
    title=`Modificar estado · Orden #${record.id}`;

    const estados=[
      "Recibida",
      "En diagnóstico",
      "En reparación",
      "Lista para entregar",
      "Entregada",
      "Cancelada"
    ];

    fields=`
      <div class="field full-field">
        <label>Estado actual</label>
        <div class="status-current">${record.status}</div>
      </div>
      ${field("Nuevo estado","status","","text",true,estados.map(x=>({
        value:x,
        label:x
      })))}
    `;
  }

  if(type==="part"){
    title="Añadir repuesto";

    fields=field("Nombre","name","Ej. Filtro de aceite")
      +field("Código","code","FIL-001")
      +field("Precio de venta","price","0","number")
      +field("Existencias","stock","0","number")
      +field("Stock mínimo","min","5","number");
  }

  if(type==="payment"){
    title="Registrar pago";

    fields=field("Orden pendiente","order","","text",true,data.balances.map(b=>({
      value:b.order,
      label:`Orden #${b.order} · ${client(b.client).name} · Pendiente ${money(b.total-b.paid)}`
    })))
      +field("Importe","amount","0","number")
      +field("Método de pago","method","","text",true,[
        "Efectivo",
        "Transferencia",
        "Tarjeta"
      ].map(x=>({value:x,label:x})));
  }

  if(type==="orderParts"){
    selectedOrderId=record.id;
    title=`Repuestos · Orden #${record.id}`;

    fields=`
      <div class="field full-field">
        <label>Agregar repuesto</label>
        <select id="orderPartSelect">
          ${data.parts.map(p=>`
            <option value="${p.id}" ${p.stock<=0?"disabled":""}>
              ${p.name} · ${money(p.price)} · Stock: ${p.stock}
            </option>
          `).join("")}
        </select>
      </div>
      <div class="field">
        <label>Cantidad</label>
        <input id="orderPartQuantity" type="number" min="1" step="1" value="1">
      </div>
      <div class="field">
        <label>Acción</label>
        <button type="button" class="primary-button" data-action="add-order-part">＋ Agregar repuesto</button>
      </div>
      <div class="field full-field">
        <label>Repuestos asociados a esta orden</label>
        <div id="orderPartsList">Cargando repuestos...</div>
      </div>
    `;
  }

  $("#modalTitle").textContent=title;
  $("#modalFields").innerHTML=fields;

  if(type==="orderStatus"){
    $('[name="status"]').value=record.status;
  }

  $("#modalBackdrop").classList.add("open");

  if(type==="orderParts"){
    cargarRepuestosOrden(record.id);
  }
}

async function cargarRepuestosOrden(orderId){
  const container=$("#orderPartsList");
  if(!container)return;

  try{
    const usages=await InventarioAPI.usosDeOrden(orderId);

    if(!usages.length){
      container.innerHTML='<p class="muted-small">Esta orden todavía no tiene repuestos.</p>';
      return;
    }

    container.innerHTML=usages.map(u=>{
      const p=u.expand?.repuesto;
      const name=p?.nombre||"Repuesto";
      const subtotal=Number(u.cantidad)*Number(u.precio_unitario);

      return `
        <div class="order-part-item">
          <div>
            <strong>${name}</strong>
            <span>${u.cantidad} unidades × ${money(u.precio_unitario)}</span>
            <span>Total: ${money(subtotal)}</span>
          </div>
          <button type="button" class="row-action" data-action="remove-order-part" data-id="${u.id}">Eliminar</button>
        </div>
      `;
    }).join("");

  }catch(error){
    container.textContent=ElPiston.errorMessage(error);
  }
}

function closeModal(){
  $("#modalBackdrop").classList.remove("open");
  selectedOrderId=null;

  const submitButton=$('#modalForm button[type="submit"]');

  if(submitButton){
    submitButton.hidden=false;
    submitButton.textContent="Guardar registro";
  }

  modalType="";
}

async function submitModal(e){
  e.preventDefault();

  if(modalType==="orderParts")return;

  const values=Object.fromEntries(new FormData(e.currentTarget).entries());

  try{
    if(modalType==="orderStatus"){
      await OrdenesAPI.actualizarEstado(selectedOrderId,values.status);

      closeModal();
      await cargarDatosPocketBase();
      showToast("Estado de la orden actualizado.");
      return;
    }

    if(modalType==="client"){
      await ClientesAPI.crear(values);
    }

    if(modalType==="vehicle"){
      if(data.vehicles.some(v=>v.plate.toLowerCase()===values.plate.trim().toLowerCase())){
        return showToast("Ya existe un vehículo con esa matrícula.");
      }

      await VehiculosAPI.crear(values);
    }

    if(modalType==="order"){
      if(!values.mechanicId){
        return showToast("Selecciona un mecánico para la orden.");
      }

      const selectedVehicle=vehicle(values.vehicle);

      await OrdenesAPI.crear({
        vehicle:values.vehicle,
        mechanicId:values.mechanicId,
        problem:values.problem,
        status:values.status,
        date:new Date().toISOString(),
        entryMileage:selectedVehicle.km
      });
    }

    if(modalType==="part"){
      if(data.parts.some(p=>p.code.toLowerCase()===values.code.trim().toLowerCase())){
        return showToast("Ya existe un repuesto con ese código.");
      }

      await InventarioAPI.crear(values);
    }

    if(modalType==="payment"){
      const b=data.balances.find(x=>String(x.order)===String(values.order));
      const amount=Number(values.amount);

      if(!b||amount<=0||amount>b.total-b.paid){
        return showToast("Comprueba el importe del pago y el saldo pendiente.");
      }

      b.paid+=amount;

      data.payments.unshift({
        client:b.client,
        order:b.order,
        date:new Date().toLocaleDateString("es-ES"),
        method:values.method,
        amount
      });

      if(b.paid>=b.total){
        data.balances=data.balances.filter(x=>x.order!==b.order);
      }

      saveData();
    }

    const currentType=modalType;

    closeModal();

   await cargarDatosPocketBase();

    renderPage(currentPage);
    showToast("Registro guardado correctamente.");

  }catch(error){
    console.error("Error guardando registro:", error);
console.error("Detalles de PocketBase:", error.response?.data);
    showToast(ElPiston.errorMessage(error));
  }
}

async function handleAction(e){
  const btn=e.target.closest("[data-action]");
  if(!btn)return;

  const id=btn.dataset.id;
  const action=btn.dataset.action;

  if(action==="add-order-part"){
    const partId=$("#orderPartSelect")?.value;
    const quantity=Number($("#orderPartQuantity")?.value);
    const orderId=selectedOrderId;

    if(!partId)return showToast("Selecciona un repuesto.");

    try{
      btn.disabled=true;

      await InventarioAPI.registrarUso(orderId,partId,quantity);

      await cargarDatosPocketBase();
      openModal("orderParts",{id:orderId});

      showToast("Repuesto agregado e inventario actualizado.");

    }catch(error){
      console.error(error);
      showToast(ElPiston.errorMessage(error));
      btn.disabled=false;
    }

    return;
  }

  if(action==="remove-order-part"){
    const orderId=selectedOrderId;

    try{
      btn.disabled=true;

      await InventarioAPI.eliminarUso(id);

      await cargarDatosPocketBase();
      openModal("orderParts",{id:orderId});

      showToast("Repuesto eliminado y existencias devueltas.");

    }catch(error){
      console.error(error);
      showToast(ElPiston.errorMessage(error));
      btn.disabled=false;
    }

    return;
  }

  if(action==="order"){
    const o=data.orders.find(x=>String(x.id)===String(id));
    if(o)openModal("orderStatus",o);
  }

  if(action==="order-parts"){
    const o=data.orders.find(x=>String(x.id)===String(id));
    if(o)openModal("orderParts",o);
  }

  if(action==="client"){
    const c=data.clients.find(x=>String(x.id)===String(id));
    if(!c)return;

    const name=prompt("Nombre del cliente:",c.name);
    if(name===null||!name.trim())return;

    try{
      await ClientesAPI.actualizar(id,{
        name:name.trim(),
        phone:c.phone,
        address:c.address
      });

      await cargarDatosPocketBase();
      showToast("Cliente actualizado.");

    }catch(error){
      showToast(ElPiston.errorMessage(error));
    }
  }

  if(action==="vehicle"){
    const v=data.vehicles.find(x=>String(x.id)===String(id));
    if(!v)return;

    const km=prompt("Actualizar kilometraje:",v.km);
    if(km===null)return;

    if(!Number.isFinite(Number(km))||Number(km)<0){
      return showToast("Introduce un kilometraje válido.");
    }

    try{
      await VehiculosAPI.actualizarKilometraje(id,Number(km));
      await cargarDatosPocketBase();
      showToast("Kilometraje actualizado.");

    }catch(error){
      showToast(ElPiston.errorMessage(error));
    }
  }

  if(action==="part"){
    const p=data.parts.find(x=>String(x.id)===String(id));
    if(!p)return;

    const stock=prompt(`Existencias de ${p.name}:`,p.stock);
    if(stock===null)return;

    if(!Number.isInteger(Number(stock))||Number(stock)<0){
      return showToast("Introduce una cantidad válida.");
    }

    try{
      await InventarioAPI.actualizarStock(id,Number(stock));
      await cargarDatosPocketBase();
      showToast("Inventario actualizado.");

    }catch(error){
      showToast(ElPiston.errorMessage(error));
    }
  }

  if(action==="balance"){
    openModal("payment");
    $('[name="order"]').value=id;
  }
}

function init(){
  const now=new Date();

  $("#logoutBtn")?.addEventListener("click", () => {
  AuthAPI.logout();
});

  $("#todayLabel").textContent=now.toLocaleDateString("es-ES",{
    weekday:"short",
    day:"numeric",
    month:"short"
  });

  $("#bannerDate").textContent=now.toLocaleDateString("es-ES",{
    weekday:"long",
    day:"numeric",
    month:"long",
    year:"numeric"
  });

  const savedTheme=localStorage.getItem("elpiston-theme");

  if(savedTheme==="dark")document.body.classList.add("dark");

  $("#darkModeSwitch").checked=document.body.classList.contains("dark");
  $("#themeToggle").textContent=document.body.classList.contains("dark")?"☀":"☾";

  $$("[data-page]").forEach(b=>{
    b.addEventListener("click",()=>navigate(b.dataset.page));
  });

  $("#themeToggle").addEventListener("click",toggleTheme);
  $("#darkModeSwitch").addEventListener("change",toggleTheme);

  $("#newOrderBtn").addEventListener("click",()=>openModal("order"));
  $("#newClientBtn").addEventListener("click",()=>openModal("client"));
  $("#newVehicleBtn").addEventListener("click",()=>openModal("vehicle"));
  $("#newPartBtn").addEventListener("click",()=>openModal("part"));
  $("#newPaymentBtn").addEventListener("click",()=>openModal("payment"));

  $("#closeModal").addEventListener("click",closeModal);
  $("#cancelModal").addEventListener("click",closeModal);

  $("#modalBackdrop").addEventListener("click",e=>{
    if(e.target.id==="modalBackdrop")closeModal();
  });

  $("#modalForm").addEventListener("submit",submitModal);

  ["orderSearch","orderFilter"].forEach(id=>{
    $("#"+id).addEventListener("input",renderOrders);
  });

  $("#clientSearch").addEventListener("input",renderClients);
  $("#vehicleSearch").addEventListener("input",renderVehicles);

  ["partSearch","partFilter"].forEach(id=>{
    $("#"+id).addEventListener("input",renderParts);
  });

  document.addEventListener("click",handleAction);

  window.addEventListener("elpiston:authenticated",cargarDatosPocketBase);

 $("#resetDemo").addEventListener("click", async () => {
  if (confirm("¿Limpiar los datos locales de demostración?")) {
    localStorage.removeItem("elpiston-demo");
    await cargarDatosPocketBase();
    showToast("Datos locales eliminados. Se muestran los registros de PocketBase.");
  }
});

  $("#notificationBtn").addEventListener("click",()=>{
    navigate("inventario");
    showToast(`${data.parts.filter(p=>p.stock<=p.min).length} repuestos necesitan atención.`);
  });

  renderDashboard();
  renderOrders();
  renderClients();
  renderVehicles();
  renderParts();
  renderPayments();
  renderReports();

  if(window.AuthAPI?.isAuthenticated()){
    document.body.classList.add("authenticated");
    cargarDatosPocketBase();
  }
}

function toggleTheme(){
  document.body.classList.toggle("dark");

  const dark=document.body.classList.contains("dark");

  localStorage.setItem("elpiston-theme",dark?"dark":"light");
  $("#themeToggle").textContent=dark?"☀":"☾";
  $("#darkModeSwitch").checked=dark;
}

document.addEventListener("DOMContentLoaded",init);