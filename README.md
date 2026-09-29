KindMetrics-Cli-Collector-UI

1. Propósito

KindMetrics-Cli-Collector-UI es la interfaz de administración del Collector de KindMetrics.

Su responsabilidad principal es permitir configurar y administrar la adquisición de información desde equipos y sistemas de telefonía hacia el almacenamiento utilizado por KindMetrics.

La UI no ejecuta directamente procesos de adquisición, protocolos, consultas a equipos ni conexiones directas a MySQL. Esas responsabilidades pertenecen al KindMetrics-Cli-Collector-API y a sus procesos de ejecución.

2. Stack obligatorio

Vue 3

Quasar

Composition API

TypeScript

<script setup>

Vue Router

Vue I18n

Axios cuando exista integración con API

ESLint

Prettier

No utilizar Pinia.

No agregar dependencias nuevas sin justificación técnica.

3. Arquitectura

Mantener:

Page
  ↓
Component
  ↓
Service
  ↓
Repository
  ↓
MockRepository / API Repository

Las Pages deben encargarse principalmente de composición, navegación y contexto.

La lógica de negocio no debe concentrarse en Pages ni templates.

4. Cadena de adquisición

Equipment
   ↓
Origin
   ↓
ExtractionMethod
   ↓
Collector
   ↓
Mapping / Transformation
   ↓
Storage

La UI configura estos elementos, pero no ejecuta directamente drivers, protocolos, SNMP, APIs de equipos ni procesos de adquisición.

5. Identidad de Company y archivo de configuración

La Company se crea desde KindMetrics-UI.

Cada Company posee un GUID único:

Company.id

Ese GUID será utilizado como nombre del archivo de configuración del Collector:

{CompanyId}.cfg

Ejemplo:

7f8c2a91-4f12-4a6d-b123-9c1e8d7f1234.cfg

Por ahora:

No existe InstallationId.

No se contemplan múltiples instalaciones de una misma Company.

No se agrega una entidad Installation.

La instalación queda asociada a la Company mediante CompanyId.

Estas posibilidades quedan fuera del alcance actual.

6. Primera ejecución

El flujo conceptual es:

Inicio
  ↓
Buscar configuración {CompanyId}.cfg
  ↓
¿Existe?
  │
  ├── NO
  │    ↓
  │  Configuración inicial
  │    ↓
  │  Solicitar/validar CompanyId
  │    ↓
  │  Configurar empresa
  │    ↓
  │  Configurar conexión a Base de Datos
  │    ↓
  │  Probar conexión
  │    ↓
  │  Guardar {CompanyId}.cfg
  │    ↓
  │  Login
  │
  └── SÍ
       ↓
     Cargar configuración
       ↓
     Login
       ↓
     Dashboard

La UI no debe acceder directamente al sistema de archivos.

La existencia, lectura y escritura del .cfg pertenecen al runtime/API del Collector.

7. Configuración inicial

El wizard debe permitir configurar como mínimo:

Company

CompanyId

Código

Nombre

El CompanyId debe corresponder al GUID generado previamente desde KindMetrics-UI.

La UI no debe generar arbitrariamente una nueva Company desde este flujo.

Base de datos

Debe contemplar los datos necesarios para la conexión a la base de datos de monitoreo:

Host
Port
Database
Username
Password
SSL / opciones de conexión

Los campos definitivos deben respetar el contrato real del Collector API.

Prueba de conexión

Debe existir una acción para probar la conexión antes de completar la instalación.

Datos de conexión
       ↓
Probar conexión
       ↓
Resultado
       ├── Éxito
       └── Error

No debe marcarse la instalación como configurada si la validación requerida falla.

8. Archivo de configuración

El archivo .cfg pertenece al entorno del Collector, no al navegador.

La UI nunca debe:

leer directamente archivos del sistema operativo;

escribir directamente el .cfg;

conectarse directamente a MySQL;

almacenar credenciales de base de datos en localStorage/sessionStorage.

La comunicación será conceptualmente:

KindMetrics-Cli-Collector-UI
          │
          │ HTTP
          ▼
KindMetrics-Cli-Collector-API
          │
          ├── InstallationService
          ├── ConfigurationService
          └── AuthenticationService
                     │
                     ▼
               {CompanyId}.cfg

El API/runtime es responsable de persistir la configuración y proteger las credenciales.

9. Estado de instalación

La UI debe manejar conceptualmente:

NOT_CONFIGURED
CONFIGURING
CONFIGURED
ERROR

Mientras no exista API real, estos estados pueden simularse mediante Mock.

Arquitectura:

InstallationRepository
        ↓
MockInstallationRepository
        ↓
InstallationService
        ↓
Pages / Components

Posteriormente:

InstallationRepository
        ↓
ApiInstallationRepository
        ↓
KindMetrics-Cli-Collector-API

Pages y Components no deben requerir una reescritura para cambiar Mock por API.

10. Login

Instalación y autenticación son responsabilidades diferentes.

La configuración responde:

¿Está configurada esta instalación?

El login responde:

¿Puede este usuario acceder al sistema?

Por lo tanto:

Configuración
      ↓
Company / conexión
      ↓
Login
      ↓
Usuario autenticado

La existencia de {CompanyId}.cfg no sustituye la autenticación.

11. Escenario Cloud

En Cloud:

Login
  ↓
KindMetrics-API
  ↓
Usuario autenticado
  ↓
UserCompanyAccess
  ↓
Empresas disponibles
  ↓
Seleccionar Company
  ↓
Contexto Company
  ↓
Dashboard

La autoridad de seguridad corresponde al KindMetrics-API.

El navegador nunca debe asumir que puede acceder a una Company simplemente porque conoce su GUID.

12. Multiempresa

Company es el tenant de KindMetrics.

Company.id es un GUID.

No se utilizará un prefijo de tablas como mecanismo principal de multi-tenancy.

La seguridad multi-tenant pertenece al API.

La UI no debe implementar reglas de autorización como autoridad final.

13. Navegación

Después del login debe existir un menú persistente:

Dashboard

Adquisición
  ├── Equipos
  ├── Orígenes
  ├── Métodos de extracción
  ├── Collectors
  └── Mappings

Almacenamiento

Configuración
  ├── Empresa
  ├── Base de datos
  └── General

Durante una instalación no configurada, el usuario debe ser dirigido al flujo de instalación.

Después de completar la instalación:

Installation → Login → Dashboard

La instalación no debe ser un módulo permanente del menú cuando ya está configurada, salvo que posteriormente se defina una necesidad administrativa.

14. Rutas conceptuales

/login
/installation
/dashboard
/equipment
/origins
/extraction-methods
/collectors
/mappings
/storage
/settings

La estructura exacta puede adaptarse a la implementación actual.

15. Protección de rutas

Conceptualmente:

                    Inicio
                      │
                      ▼
              Installation Status
                      │
            ┌─────────┴─────────┐
            │                   │
      NOT_CONFIGURED         CONFIGURED
            │                   │
            ▼                   ▼
     Installation            Login
                                  │
                                  ▼
                              Dashboard

Si el estado es NOT_CONFIGURED, las rutas protegidas deben redirigir a /installation.

Si está configurado, debe continuar el flujo normal de Login.

La protección definitiva debe coordinarse con el API.

16. Mock

Mientras el Collector API no esté integrado, utilizar Mock Repositories.

Debe poder simular:

instalación no configurada;

CompanyId;

datos de empresa;

configuración de base de datos;

prueba de conexión;

instalación configurada;

login;

Company actual;

navegación.

No simular conexiones reales a MySQL desde el navegador.

17. Branding y Skins

Mantener:

Logo KIND Technologies

Branding de Company

Nombre de Company

Idioma

Skin

Skin Default:

Azul petróleo oscuro

No modificar la arquitectura funcional al cambiar de skin.

18. Internacionalización

Toda cadena visible debe utilizar Vue I18n:

títulos;

menús;

botones;

labels;

placeholders;

mensajes de validación;

errores;

éxito;

instalación;

configuración;

login;

navegación.

El idioma debe cambiar en runtime sin reload ni pérdida de estado.

Los datos de negocio no se traducen automáticamente:

Company.name
Company.code
Equipment.name
Origin.name
Collector.name
Metric.name

19. Seguridad

La UI no es autoridad de seguridad.

La seguridad real corresponde a:

KindMetrics-Cli-Collector-API

y cuando corresponda:

KindMetrics-API

No almacenar credenciales reales innecesariamente en localStorage/sessionStorage.

20. Referencias

KindMetrics utiliza como referencias:

Grafana

Apache Superset

Se consideran referencias para navegación, dashboards, consultas, visualización y UX.

No copiar su arquitectura interna.

El Collector tiene una responsabilidad específica de adquisición de datos de telefonía y voz.

21. Fuera del alcance actual

No implementar:

InstallationId;

múltiples instalaciones de una Company;

prefijos de tablas como mecanismo de multi-tenancy;

drivers reales de equipos dentro de Vue;

ejecución directa de SNMP/API/protocolos desde Vue;

conexión directa de Vue a MySQL;

permisos finales del Collector que todavía no estén definidos;

contratos de API no aprobados;

entidades de dominio que todavía no tengan definición aprobada.

22. Principio general

KindMetrics-UI
    Administración global
    Companies
    Usuarios
    Dashboards
    Configuración global
          │
          ▼
KindMetrics-API
    Seguridad
    Multi-tenant
    Empresas
    Usuarios
    Permisos
          │

KindMetrics-Cli-Collector-UI
    Configuración y administración del Collector
          │
          ▼
KindMetrics-Cli-Collector-API
    Configuración local
    Archivo {CompanyId}.cfg
    Conexiones
    Ejecución de adquisición
          │
          ▼
Collector / BackgroundService
    Adquisición
    Normalización
    Persistencia
          │
          ▼
Monitoring Database

La UI debe permanecer desacoplada de los detalles físicos de ejecución y almacenamiento.