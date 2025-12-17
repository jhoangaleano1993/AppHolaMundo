# App Hola Mundo - Node.js + Express

Aplicación web simple que muestra "Hola Mundo" con pipeline completo de CI/CD usando Azure DevOps, análisis con SonarCloud, contenedorización con Docker, publicación en AWS ECR y despliegue en EKS (Kubernetes).

## Características

- Aplicación web Node.js con Express
- Pruebas unitarias con Jest
- Cobertura de código configurada (umbral: 80%)
- Dockerfile multi-stage optimizado
- Manifiestos de Kubernetes (Deployment, Service, HPA)
- Pipeline de Azure DevOps con shared libraries
- Integración con SonarCloud para análisis de código
- Publicación automática en AWS ECR
- Despliegue automático en EKS
- Pruebas de conectividad post-despliegue

## Estructura del Proyecto

```
AppHolaMundo/
├── src/
│   ├── app.js                  # Aplicación Express
│   ├── server.js               # Servidor HTTP
│   └── __tests__/
│       └── app.test.js         # Pruebas unitarias
├── k8s/
│   ├── deployment.yaml         # Deployment de Kubernetes
│   ├── service.yaml            # Service de Kubernetes
│   └── hpa.yaml                # Horizontal Pod Autoscaler
├── Dockerfile                  # Imagen de contenedor
├── .dockerignore              # Archivos excluidos del build
├── azure-pipelines.yml        # Pipeline principal
├── package.json               # Dependencias y scripts
└── README.md                  # Este archivo
```

## Requisitos Previos

- Node.js 20.x o superior
- Docker
- kubectl configurado para EKS
- Cuenta de Azure DevOps
- Cuenta de AWS con acceso a ECR y EKS
- Cuenta de SonarCloud

## Instalación Local

1. Clonar el repositorio:
```bash
cd ~/PruebaDevOps/AppHolaMundo
```

2. Instalar dependencias:
```bash
npm install
```

3. Ejecutar la aplicación:
```bash
npm start
```

La aplicación estará disponible en `http://localhost:3000`

## Scripts Disponibles

```bash
npm start          # Iniciar la aplicación
npm run dev        # Iniciar con nodemon (auto-reload)
npm test           # Ejecutar pruebas unitarias
npm run test:coverage  # Ejecutar pruebas con reporte de cobertura
npm run lint       # Ejecutar linter (ESLint)
```

## Endpoints

- `GET /` - Retorna mensaje "Hola Mundo"
  ```json
  {
    "message": "Hola Mundo",
    "timestamp": "2025-12-14T10:30:00.000Z",
    "version": "1.0.0"
  }
  ```

- `GET /health` - Health check endpoint
  ```json
  {
    "status": "healthy",
    "uptime": 123.456,
    "timestamp": "2025-12-14T10:30:00.000Z"
  }
  ```

## Pruebas

### Ejecutar Pruebas Unitarias

```bash
npm test
```

### Ejecutar con Cobertura

```bash
npm run test:coverage
```

El reporte de cobertura se genera en el directorio `coverage/`.

**Umbrales de cobertura configurados:**
- Branches: 80%
- Functions: 80%
- Lines: 80%
- Statements: 80%

## Containerización

### Construir la Imagen

```bash
docker build -t app-hola-mundo:latest .
```

### Ejecutar el Contenedor

```bash
docker run -p 3000:3000 app-hola-mundo:latest
```

### Características del Dockerfile

- Multi-stage build para optimizar tamaño
- Usuario no-root para seguridad
- Health check configurado
- Basado en Alpine Linux (imagen ligera)

## CI/CD con Azure DevOps

### Pipeline Principal

El archivo [azure-pipelines.yml](azure-pipelines.yml) define un pipeline de 5 etapas que sigue la metodología Gitflow:

#### Stage 1: Build
- **Job: BuildAndTest**
  - Instala Node.js 20.x
  - Instala dependencias con npm ci
  - Ejecuta pruebas unitarias con Jest
  - Genera reportes de cobertura (JUnit y Cobertura)
  - Publica resultados de tests y coverage en Azure DevOps
  - Analiza código con SonarCloud
  - Publica manifiestos de Kubernetes como artefactos

#### Stage 2: ContainerBuild
- **Job: Docker**
  - Autenticación en AWS ECR
  - Construye imagen Docker multi-stage
  - Etiqueta la imagen con:
    - Build ID (`$(Build.BuildId)`)
    - Branch name (`$(Build.SourceBranchName)`)
    - Latest
  - Publica en AWS ECR

#### Stage 3: DeployDev
- **Condición**: Solo en rama `dev`
- **Environment**: Development
- Despliega en namespace `dev` de EKS
- Aplica manifiestos de Kubernetes
- Realiza pruebas de conectividad HTTP

#### Stage 4: DeployQA
- **Condición**: Solo en ramas `release/*`
- **Environment**: QA
- Despliega en namespace `qa` de EKS
- Aplica manifiestos de Kubernetes
- Realiza pruebas de conectividad HTTP

#### Stage 5: DeployProd
- **Condición**: Solo en rama `main`
- **Environment**: Production
- Despliega en namespace `production` de EKS
- Aplica manifiestos de Kubernetes
- Realiza pruebas de conectividad HTTP

### Shared Libraries

El pipeline usa templates reutilizables del repositorio [AzureDevOpsTemplate](https://github.com/jhoangaleano1993/AzureDevOpsTemplate):
- `templates/build-steps.yml` - Configuración de Node.js e instalación de dependencias
- `templates/test-steps.yml` - Ejecución de tests y publicación de resultados
- `templates/sonar-analysis.yml` - Análisis de código con SonarCloud
- `templates/docker-build.yml` - Build y push de imágenes Docker a ECR
- `templates/k8s-deploy.yml` - Despliegue en Kubernetes
- `templates/connectivity-test.yml` - Pruebas de conectividad post-despliegue

### Variable Groups Requeridos en Azure DevOps

Configura estos Variable Groups en Azure DevOps → Pipelines → Library:

#### 1. AWS-Credentials
| Variable | Descripción | Tipo |
|----------|-------------|------|
| `AWS_ACCESS_KEY_ID` | Access Key del usuario IAM | Secreto 🔒 |
| `AWS_SECRET_ACCESS_KEY` | Secret Access Key del usuario IAM | Secreto 🔒 |

#### 2. AWS-ECR
| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `AWS_REGION` | Región de AWS | `us-east-1` |
| `ECR_REGISTRY` | URL del registro ECR | `123456789.dkr.ecr.us-east-1.amazonaws.com` |

#### 3. SonarCloud-Shared
| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `SONAR_ORGANIZATION` | Organización en SonarCloud | `mi-organizacion` |

#### 4. SonarCloud-AppHolaMundo
| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `SONAR_PROJECT_KEY` | Project Key en SonarCloud | `jhoangaleano1993_AppHolaMundo` |

### Service Connections Requeridas

Crea estas Service Connections en Azure DevOps → Project Settings → Service connections:

1. **AWS-ECR-Connection** (Type: AWS)
   - Usa las credenciales del usuario IAM `azure-devops-terraform`
   - Para autenticación en ECR y push de imágenes Docker

2. **SonarCloud-Connection** (Type: SonarCloud)
   - Token de autenticación de SonarCloud
   - Para análisis de calidad de código

3. **eks-cluster-connection** (Type: Kubernetes)
   - KubeConfig con ServiceAccount token
   - Para despliegue en el cluster EKS

4. **AzureDevOpsTemplate** (Type: GitHub)
   - Conexión al repositorio de templates compartidos
   - Para usar los templates del pipeline

## Despliegue en Kubernetes

### Manifiestos Incluidos

1. **deployment.yaml**:
   - 3 réplicas por defecto
   - Health checks configurados
   - Resource limits definidos
   - Security context aplicado

2. **service.yaml**:
   - Tipo LoadBalancer
   - Expone puerto 80 → 3000

3. **hpa.yaml**:
   - Auto-escalado 3-10 pods
   - Basado en CPU (70%) y memoria (80%)
