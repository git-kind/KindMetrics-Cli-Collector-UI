# KindMetrics-Cli-Collector-UI

## Propósito

`KindMetrics-Cli-Collector-UI` es la interfaz de administración y configuración del Collector de KindMetrics.

Administra la instalación local, Company, conexión, equipos/devices, discovery, métodos de extracción, Collectors, selección de datos, mappings, almacenamiento, ejecución, sincronización, logs y pruebas.

La UI configura y administra. La ejecución real corresponde a `KindMetrics-Cli-Collector-API` y `KindMetrics-Cli-BS`.

La UI nunca debe conectarse directamente a MySQL ni ejecutar directamente protocolos de adquisición.

## Arquitectura de adquisición

```text
Equipo / Sistema
      ↓
Método de Extracción
      ↓
Discovery / Datos disponibles
      ↓
Collector
      ↓
Mapeo / Transformación
      ↓
Almacenamiento
      ↓
KindMetrics
```

## Método de Extracción vs Collector

### Método de Extracción

Representa una conexión concreta hacia un sistema, dispositivo o servicio.

Define:

- Tipo de extracción.
- Conexión.
- Credenciales.
- Discovery.
- Target.
- Datos disponibles.
- Capacidades.

Ejemplos:

```text
SNMP - Cisco C9300-01
SNMP - AudioCodes 2345
API - Voca 2223
Microsoft Graph - Patito
Webhook - Sistema CDR
```

Microsoft Teams no es un protocolo. El mecanismo técnico es Microsoft Graph. La UI puede mostrar `TEAMS - Patito`, pero internamente el tipo debe ser `MICROSOFT_GRAPH`.

### Collector

Representa la configuración de un proceso de adquisición.

Define:

- Qué Métodos de Extracción utilizar.
- Qué datos obtener.
- Qué datos seleccionar.
- Cómo transformar los datos.
- A qué estructura almacenarlos.
- Cuándo obtenerlos.
- Cómo ejecutarlos.
- Qué registrar en logs.
- Cuándo sincronizarlos, si aplica.

> Un Collector es la configuración de un proceso de adquisición que utiliza uno o varios Métodos de Extracción, selecciona los datos requeridos, los transforma cuando sea necesario, los asigna a una estructura de almacenamiento y ejecuta el proceso bajo una determinada programación.

## Frecuencia de adquisición

La frecuencia de obtención de datos pertenece al **Collector**, dentro de `Ejecución`.

No pertenece al Método de Extracción.

Un mismo Método puede ser reutilizado:

```text
SNMP - Cisco C9300-01
        │
        ├── Collector A → cada 1 minuto
        ├── Collector B → cada 5 minutos
        └── Collector C → cada 1 hora
```

El Método define cómo y desde dónde obtener datos. El Collector define qué datos obtener y cuándo obtenerlos.

Para métodos orientados a eventos puede no existir polling; pueden utilizar `EVENT_DRIVEN`.

La frecuencia de adquisición y la de sincronización son independientes.

## Instalación

`kindCli.cfg` pertenece al runtime/API del Collector.

Primer inicio:

```text
Inicio
 ↓
No existe kindCli.cfg
 ↓
Instalación inicial
 ↓
Empresa
 ↓
Base de datos
 ↓
Probar conexión
 ↓
Guardar configuración
 ↓
Login
```

Posteriormente:

```text
Inicio
 ↓
Existe kindCli.cfg
 ↓
Cargar configuración
 ↓
Validar conexión
 ↓
Login
 ↓
Dashboard
```

La UI consulta al API el estado de instalación.

## Company

Una instalación Customer pertenece a una única Company.

```text
Company
   │
   └── CompanyId (GUID)
          │
          └── configuración de instalación
```

En una instalación administrada por KIND puede existir un selector de Company después del login.

Cada Company puede tener su propia base de datos:

```text
KindMetrics_PatitoFeo
KindMetrics_Rufus
KindMetrics_Saxofon
```

Las Company DB usan el mismo esquema funcional, pero los datos están aislados.

La selección física de DB corresponde al backend. La UI nunca debe manipular directamente la conexión.

## Equipment / Devices

LibreNMS utiliza el concepto `Devices`, y KindMetrics debe conservar esta distinción cuando exista un dispositivo.

Ejemplo:

```text
Device:
Cisco C9300-01

IP:
10.20.30.40

Vendor:
Cisco

Model:
C9300-24T

OS:
IOS-XE

Version:
17.x

Discovery:
Completed
```

No todos los métodos tienen un Device. Un target puede ser:

- Device.
- API Service.
- Microsoft Graph Tenant/Service.
- WebHook Source.
- Otro target específico.

## Discovery

Flujo:

```text
Datos de conexión
        ↓
Connectivity Test
        ↓
Device Discovery
        ↓
Identification
        ↓
Equipment Definition
        ↓
Capabilities
        ↓
Available Data
        ↓
Obtención de Datos
        ↓
Mapping
        ↓
Storage
        ↓
Collector
```

Para SNMP, la identificación inicial puede utilizar `sysObjectID` y `sysDescr`.

Posteriormente pueden determinarse fabricante, familia, modelo, OS, versión, capacidades, OIDs, sensores, interfaces y métricas disponibles.

LibreNMS es referencia funcional, no dependencia.

## Definiciones globales

Pueden existir definiciones reutilizables de:

```text
Equipment Definitions
Discovery Definitions
OID Definitions
Extraction Definitions
Vendor Definitions
Model Definitions
Protocol Definitions
```

Ejemplo:

```text
Cisco IOS-XE
  ├── sysObjectID
  ├── sysDescr
  ├── OIDs
  ├── Sensors
  ├── Interfaces
  └── Available Metrics
```

La ubicación física definitiva de estas definiciones entre almacenamiento global y Company DB continúa siendo una decisión de arquitectura independiente.

## Métodos de Extracción

Tipos iniciales:

```text
SNMP
API
MICROSOFT_GRAPH
WEBHOOK
```

### SNMP

Puede configurar host/IP, puerto, versión, credenciales, discovery, datos disponibles, OIDs y capacidades.

### API

Configura la conexión necesaria para el servicio correspondiente.

### Microsoft Graph

Puede requerir:

- Tenant ID.
- Client ID.
- Client Secret o certificado.
- OAuth 2.0 / Entra ID.
- Scopes/permisos.

Discovery puede exponer Teams, Channels, Users, Members y Messages según los permisos.

### WebHook

Está orientado a recepción de eventos y puede trabajar en modo `EVENT_DRIVEN`.

## Datos disponibles

Un Método de Extracción puede exponer datos utilizables por Collectors:

```text
NumeroLlamadas
NumeroLlamadasPerdidas
DuracionPromedio
CallingNumber
CalledNumber
StartTime
```

El Collector selecciona cuáles necesita obtener.

## Collector

Estructura conceptual:

```text
Collector
│
├── Generales
├── Estructura de Datos
│   ├── Tablas
│   └── Campos
├── Métodos de Extracción
│   ├── Conexión
│   └── Datos disponibles
├── Asignación de Datos / Mapeo
│   ├── Origen
│   ├── Transformación
│   └── Destino
├── Ejecución
│   ├── Modo
│   ├── Frecuencia
│   └── Estado de ejecución
├── Logs
└── Sincronización
    └── Opcional
```

Agrupación recomendada:

```text
CONFIGURACIÓN
- Generales
- Estructura de Datos
- Métodos de Extracción
- Asignación de Datos

OPERACIÓN
- Ejecución
- Logs
- Sincronización
```

No debe existir una pestaña global `Health`. Las pruebas deben pertenecer a la operación que se está validando.

## Estructura de Datos

Debe comportarse como una pantalla de administración de base de datos, conceptualmente similar a MySQL Workbench, phpMyAdmin o DBeaver.

Debe permitir:

- Listar y buscar tablas.
- Crear, editar y eliminar tablas.
- Seleccionar una tabla.
- Crear, editar y eliminar columnas.
- Administrar índices.

Diseño:

```text
┌───────────────────────┬──────────────────────────────────────┐
│ ESTRUCTURA            │ DETALLE DE TABLA                    │
│                       │                                      │
│ Base de datos         │ calls                                │
│                       │ [Estructura] [Índices]              │
│ 📁 Tablas             │                                      │
│   ├─ calls            │ id BIGINT PK                         │
│   ├─ call_events      │ calling_number VARCHAR(50)           │
│   └─ statistics       │ ...                                  │
│                       │ [+ Nueva columna]                    │
│ [+ Nueva tabla]       │                                      │
└───────────────────────┴──────────────────────────────────────┘
```

Modelos conceptuales:

```text
DatabaseStructure
└── tables[]

DatabaseTable
├── id
├── name
├── description
├── columns[]
└── indexes[]

DatabaseColumn
├── id
├── name
├── dataType
├── length
├── nullable
├── primaryKey
├── autoIncrement
├── defaultValue
└── comment

DatabaseIndex
├── id
├── name
├── type
└── columns[]
```

Tipos iniciales:

```text
BIGINT
INT
DECIMAL
VARCHAR
TEXT
BOOLEAN
DATE
DATETIME
TIMESTAMP
JSON
```

No debe existir editor SQL libre.

La UI define la estructura deseada. El API aplicará posteriormente los cambios físicos en MySQL.

## Mapping

El Mapping representa:

```text
DATO OBTENIDO
      ↓
ORIGEN
      ↓
TRANSFORMACIÓN
      ↓
DESTINO
```

Ejemplo:

```text
Dato:
NumeroLlamadas

Origen:
Método: API - CDR
Dato origen: totalCalls

Transformación:
NONE

Destino:
Tabla: calls
Campo: total_calls
```

Debe tener CRUD completo:

- Crear.
- Consultar.
- Editar.
- Eliminar.

Debe existir:

```text
[+ Nueva asignación]
```

Modelo conceptual:

```text
DataMapping
├── id
├── collectorId
├── dataId
├── acquisitionMethodId
├── sourceField
├── transformation
├── transformationConfig
├── destinationTable
├── destinationField
├── status
├── createdAt
└── updatedAt
```

Referencias cuando existan entidades correspondientes:

```text
dataId → CollectorData
acquisitionMethodId → ExtractionMethod
destinationTableId → DatabaseTable
destinationFieldId → DatabaseColumn
```

El Método y Dato Origen deben depender del dato seleccionado.

El Campo Destino debe depender de la tabla seleccionada.

No se debe permitir duplicar exactamente el mismo origen y destino dentro del Collector.

## Transformaciones

Catálogo inicial:

```text
NONE
CONVERT_TYPE
MULTIPLY
DIVIDE
ADD
SUBTRACT
EXTRACT
MAP_VALUE
```

Las transformaciones configurables deben mostrar sólo los parámetros necesarios.

No implementar inicialmente un editor de expresiones complejo.

## Prueba de Mapping

Ejemplo:

```text
Dato origen: totalCalls
Valor: 1250
Transformación: NONE
Resultado: 1250
Destino: calls.total_calls

✓ Asignación válida
```

Eliminar un Mapping nunca debe eliminar el Método, dato origen, tabla, campo destino ni datos físicos existentes.

## Ejecución

Define cómo y cuándo trabaja el Collector.

Puede incluir:

- Modo.
- Frecuencia.
- Programación.
- Estado.
- Última ejecución.
- Próxima ejecución.
- Resultado.
- Prueba.

Ejemplo:

```text
Modo:
POLLING

Frecuencia:
Cada 5 minutos
```

Para eventos:

```text
Modo:
EVENT_DRIVEN
```

La UI configura. El scheduler real corresponde a `KindMetrics-Cli-BS`.

## Logs

Debe permitir consultar:

- Fecha/hora.
- Nivel.
- Ejecución.
- Operación.
- Mensaje.
- Resultado.
- Error.

La generación y persistencia real corresponde al API/BS.

## Sincronización

Es independiente de la adquisición.

Ejemplo:

```text
Adquisición:
Cada 1 minuto

Sincronización:
Cada 15 minutos
```

Puede incluir:

- Habilitación.
- Frecuencia.
- Última sincronización.
- Próxima sincronización.
- Datos pendientes.
- Último resultado.
- Prueba.

La sincronización real corresponde al backend/BackgroundService.

## Almacenamiento

Nombres preferidos:

```text
Almacenamiento Servidor
Local Temporal
```

Debe evitarse usar únicamente `Local`, porque la UI puede ejecutarse en KIND mientras el almacenamiento temporal pertenece al Collector del cliente.

## Arquitectura Frontend

Stack obligatorio:

- Vue 3.
- Quasar.
- Composition API.
- TypeScript.
- `<script setup>`.
- Vue Router.
- Vue I18n.
- ESLint.
- Prettier.

No utilizar Pinia.

No agregar dependencias sin justificación.

### Pages

Composición, layout, navegación y contexto.

No deben contener lógica de negocio compleja.

### Components

Contienen la experiencia principal de usuario y pueden utilizar Services.

### Services

Representan operaciones de negocio concretas y deben ser cortos y específicos.

### Repositories

Abstraen el origen de datos.

```text
MockRepository
      ↓
Service
      ↓
Component
```

Posteriormente:

```text
API Repository
      ↓
Service
      ↓
Component
```

La sustitución de Mock por API no debe obligar a reescribir Pages o Components.

## Mock

Debe simular:

- Companies.
- Equipment/Devices.
- Extraction Methods.
- Discovery.
- Available Data.
- Collectors.
- Database Structures.
- Mappings.
- Storage.
- Execution.
- Logs.
- Synchronization.

Los contratos Mock deben diseñarse compatibles con el futuro API.

## Internacionalización

Toda cadena visible debe usar Vue I18n.

El cambio de idioma debe ser dinámico, sin recargar ni perder sesión, Company activa o estado de edición.

Los datos de negocio no deben traducirse automáticamente:

```text
Company names
Equipment names
Collector names
Metric names
Database names
Dashboard names
```

## Lo que la UI NO debe hacer

No debe:

- Conectarse directamente a MySQL.
- Ejecutar SQL directamente.
- Ejecutar SNMP directamente.
- Ejecutar APIs de adquisición directamente.
- Ejecutar Microsoft Graph directamente.
- Ejecutar WebHooks directamente.
- Implementar scheduler.
- Implementar BackgroundService.
- Ejecutar sincronizaciones reales.
- Implementar retry de infraestructura.
- Implementar motor de adquisición.
- Implementar drivers.
- Implementar protocolos.
- Decidir físicamente qué Company DB utilizar.

Estas responsabilidades pertenecen al API, Collector runtime y/o BackgroundService.

## Menú principal

```text
Dashboard
Equipos
Métodos de Extracción
Collectors
Mappings
Almacenamiento
Configuración
```

No es necesario un contenedor superior `Adquisición`.

## Rutas

```text
/login
/dashboard
/equipment
/extraction-methods
/collectors
/mappings
/storage
/settings
```

Después del login:

```text
/login
   ↓
/dashboard
```

En instalaciones KIND puede existir selección de Company.

En Customer, la Company ya está determinada por la instalación.

## Referencias funcionales

### Grafana

Referencia para dashboards, datasources, query experience, visualizaciones, usuarios y permisos.

### Apache Superset

Referencia para datasets, SQL/Exploration, charts, dashboards, filtros y análisis.

### LibreNMS

Referencia especialmente para Devices, SNMP, Discovery, identificación, OIDs, definiciones, capacidades, sensores e interfaces.

Son referencias funcionales y de UX, no dependencias.

## Flujo completo

```text
CONFIGURAR
    ↓
VALIDAR
    ↓
PROBAR
    ↓
ACTIVAR
    ↓
EJECUTAR
    ↓
REGISTRAR
    ↓
SINCRONIZAR
```

Detalle:

```text
Company
  ↓
Equipment / Target
  ↓
Extraction Method
  ↓
Discovery
  ↓
Available Data
  ↓
Collector
  ↓
Data Selection
  ↓
Mapping
  ↓
Storage
  ↓
Execution
  ↓
Logs
  ↓
Synchronization
```

## Regla fundamental

```text
Extraction Method
    =
cómo y desde dónde obtener datos

Collector
    =
qué datos obtener
+ cómo procesarlos
+ dónde almacenarlos
+ cuándo obtenerlos
+ cuándo sincronizarlos
```

Por lo tanto:

- Conexión → Método de Extracción.
- Discovery → Método de Extracción.
- Datos disponibles → Método de Extracción.
- Selección de datos → Collector.
- Mapping → Collector.
- Frecuencia de adquisición → Collector.
- Ejecución → Collector.
- Logs → Collector.
- Sincronización → Collector.

## Reglas de modificación

Antes de modificar el proyecto:

1. Revisar el código existente.
2. Revisar la documentación global.
3. Respetar decisiones aprobadas.
4. No reemplazar archivos completos innecesariamente.
5. No realizar refactors no solicitados.
6. Mantener Page, Component, Service y Repository separados.
7. Mantener Mock compatible con API.
8. Mantener i18n.
9. Mantener ESLint y Prettier.
10. Evitar nuevas dependencias sin justificación.

Cuando se solicite una modificación, cambiar únicamente lo necesario.

## Documentación global

La documentación global está en:

```text
../docs/
```

Es la fuente de verdad global.

Cuando se modifique documentación:

- Partir de la versión existente.
- Aplicar sólo modificaciones aprobadas.
- No regenerar toda la documentación perdiendo contenido anterior.
- Mantener coherencia entre proyectos.

Este `README.md` documenta específicamente `KindMetrics-Cli-Collector-UI`.

## Estado conceptual actual

```text
✓ Company como contexto de instalación
✓ Una instalación Customer pertenece a una Company
✓ Company DB independiente por empresa
✓ Equipment / Device
✓ Discovery
✓ Extraction Method como conexión concreta
✓ Microsoft Graph como mecanismo técnico para Teams
✓ Collector como proceso de adquisición
✓ Un Method puede reutilizarse por varios Collectors
✓ Un Collector puede utilizar varios Methods
✓ Frecuencia de adquisición en Collector
✓ Mapping dentro de Collector
✓ CRUD de Mapping
✓ Estructura de Datos como administración de DB
✓ CRUD de tablas
✓ CRUD de columnas
✓ CRUD de índices
✓ Ejecución en Collector
✓ Logs en Collector
✓ Sincronización independiente
✓ Mock Repository
✓ API como autoridad
✓ UI sin acceso directo a MySQL
✓ UI sin ejecución directa de protocolos
✓ Vue 3 + Quasar + TypeScript
✓ Composition API + script setup
✓ Vue Router
✓ Vue I18n
✓ Sin Pinia
✓ ESLint
✓ Prettier
```

## Regla para asistentes de IA

Cualquier asistente de IA que modifique este proyecto debe tratar este README y la documentación global como referencia arquitectónica.

No debe reintroducir `Obtención de Datos` como módulo independiente cuando la funcionalidad corresponda a `Extraction Methods + Collector`.

No debe mover la frecuencia de adquisición al Método de Extracción.

No debe convertir Microsoft Teams en un protocolo.

No debe implementar acceso directo a MySQL desde la UI.

No debe implementar drivers, scheduler o ejecución real de adquisición dentro del frontend.
