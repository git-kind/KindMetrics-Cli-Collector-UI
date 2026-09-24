# KindMetrics-Cli-Collector-UI

Frontend de administración de la instalación cliente de **KindMetrics** y configuración de adquisición de datos.

## 1. Stack obligatorio

Todo Frontend de KindMetrics utiliza:

- Vue 3.
- Quasar.
- Composition API.
- TypeScript.
- `<script setup lang="ts">`.
- Vue Router.
- Vue I18n.
- ESLint.
- Prettier.
- Sin Pinia.

No utilizar Options API para código nuevo.

## 2. Responsabilidad

Este proyecto administra la instalación cliente y su configuración de adquisición.

```text
Equipment
    ↓
Origin
    ↓
Extraction Method
    ↓
Collector
    ↓
Mapping
    ↓
Storage
```

La ejecución real de conectores, protocolos, extracción y tareas de background pertenece a `KindMetrics-Cli-Collector-API` y `KindMetrics-Cli-BS`.

El Frontend no implementa drivers, Scheduler, CRON, protocolos de equipos ni acceso directo a MySQL.

## 3. Arquitectura Frontend

```text
Page
  ↓
Component
  ↓
Service
  ↓
Repository
  ├── Mock
  └── API (futuro)
```

La UI debe poder pasar de Mock a API sin reescribir Pages y Components.

## 4. Mock inicial

El proyecto incluye pantallas Mock funcionales para:

- Login.
- Resumen.
- Equipment.
- Origins.
- Extraction Methods.
- Collectors.
- Mappings.
- Storage.
- Settings.

El resumen muestra el flujo completo de adquisición y datos de ejemplo de una instalación cliente.

Credenciales Mock:

```text
Usuario: admin
Contraseña: admin123
```

Estas credenciales son exclusivamente de desarrollo y deben desaparecer al conectar el API real.

## 5. Multiidioma

Se utiliza Vue I18n con cambio de idioma en runtime:

- Español (`es`).
- English (`en`).

El cambio de idioma no requiere recargar la aplicación.

Los identificadores internos y los datos de negocio no se traducen automáticamente.

## 6. Themes y Skins

La interfaz incorpora el mismo concepto de configuración visual utilizado por KindMetrics-UI:

- Theme: estructura visual general.
- Skin: identidad cromática.
- Branding: identidad de la empresa.

El Skin Default utiliza como base el **azul petróleo oscuro**.

Incluye inicialmente:

- Default.
- Midnight.
- Slate.

La selección se conserva en `localStorage` como preferencia local del Front Mock.

## 7. Branding y logos

El proyecto mantiene una capa de Branding separada de Theme/Skin.

El Mock incluye el logo de **KIND Technologies** utilizado visualmente en KindMetrics-UI como referencia de marca.

El logo de Company está modelado como dato de branding (`CompanyBranding`) para que posteriormente pueda provenir del API sin modificar Layouts o Components.

No se debe asumir que todas las empresas utilizan el logo de KIND Technologies.

## 8. Login

El Login es Mock en esta etapa.

El router protege las rutas de la aplicación y redirige a `/login` cuando no existe una sesión Mock.

La autenticación definitiva será responsabilidad del API local y/o del mecanismo de autenticación que se defina para la instalación cliente.

La UI no debe considerarse la frontera de seguridad.

## 9. Documentación global

La fuente de verdad global continúa siendo:

```text
../docs/
```

No crear una segunda carpeta `docs` dentro de este proyecto.

Las decisiones de arquitectura, negocio, seguridad, Collector, Storage, ingestión y contratos compartidos deben revisarse contra la documentación global.

## 10. Regla de desarrollo

Cuando una definición del dominio todavía esté pendiente, no inventar campos ni contratos definitivos. El Mock puede utilizar datos mínimos exclusivamente para validar navegación y UX.

Las modificaciones sobre código existente deben ser mínimas y respetar:

- TypeScript.
- ESLint.
- Arquitectura por capas.
- Vue 3 + Quasar + Composition API + `<script setup>`.
- Compatibilidad Mock → API.
