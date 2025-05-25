# Node.js App with Skaffold + Flux + Kustomize

A complete setup demonstrating how to use the same Node.js application across local development (Skaffold) and remote environments (Flux GitOps) with Kustomize overlays.

## Quick Start

### 1. File Structure
Create the following files in your project:

```
my-app/
├── server.js                # Main Node.js application
├── package.json             # Node.js dependencies
├── Dockerfile               # Container configuration
├── .dockerignore            # Docker ignore file
├── skaffold.yaml            # Skaffold configuration
└── k8s/                     # Kubernetes manifests
    ├── base/
    │   ├── kustomization.yaml
    │   ├── deployment.yaml
    │   ├── service.yaml
    │   ├── configmap.yaml
    │   └── hpa.yaml
    └── overlays/
        ├── local/
        ├── dev/
        ├── staging/
        └── prod/
```

### 2. Install Dependencies

```bash
# Install Node.js dependencies
npm install

# Install development tools
npm install -g skaffold
# Or follow: https://skaffold.dev/docs/install/

# Install kubectl and kustomize
# Follow: https://kubernetes.io/docs/tasks/tools/
```

### 3. Local Development

```bash
# Start local development with live reload
skaffold dev

# Or build and deploy once
skaffold run

# Clean up local deployment
skaffold delete
```

### 4. Test the Application

Once running, visit:
- **Main app**: http://localhost:8080
- **Health check**: http://localhost:8080/health  
- **API status**: http://localhost:8080/api/status
- **App info**: http://localhost:8080/info

### 5. Docker Development (Alternative)

```bash
# Build the image
docker build -t my-app .

# Run locally
docker run -p 8080:8080 -e ENV=local -e LOG_LEVEL=debug my-app

# Test health endpoint
curl http://localhost:8080/health
```

## Application Features

### Endpoints

- **`/`** - Main application page with environment info
- **`/health`** - Health check (for liveness probe)
- **`/ready`** - Readiness check (for readiness probe)  
- **`/info`** - Application information and metrics
- **`/api/status`** - API status and available endpoints
- **`/api/hello?name=World`** - Simple API example

### Environment Configuration

The app reads these environment variables:

- **`PORT`** - Server port (default: 8080)
- **`ENV`** - Environment name (local/dev/staging/prod)
- **`LOG_LEVEL`** - Logging level (error/warn/info/debug)
- **`DATABASE_HOST`** - Database connection (from ConfigMap)
- **`DATABASE_TIMEOUT`** - Database timeout (from ConfigMap)

### Health Checks

- **Liveness Probe**: `/health` - Kubernetes restarts pod if this fails
- **Readiness Probe**: `/ready` - Kubernetes stops sending traffic if this fails
- **Docker Health Check**: Built into Dockerfile for container health

## Deployment Workflow

### Local Development
```bash
# Start with hot reload
skaffold dev

# The app runs with:
# - 1 replica
# - Debug logging
# - Reduced resource limits
# - Port forwarding to localhost:8080
```

### Development Environment (Flux)
```bash
# Push to main branch
git add .
git commit -m "Update application"
git push origin main

# Flux automatically:
# - Deploys to my-app-dev namespace
# - Uses dev image tag
# - Applies dev configuration
# - Enables debug logging
```

### Staging Environment (Flux)
```bash
# Same as dev, but:
# - Deploys to my-app-staging namespace  
# - Uses staging image tag
# - Higher resource limits
# - Info-level logging
# - SSL/TLS enabled
```

### Production Environment (Flux)
```bash
# Create a release tag
git tag v1.0.0
git push origin v1.0.0

# Flux automatically:
# - Deploys only tagged releases
# - Uses my-app-prod namespace
# - Production resource limits
# - Warn-level logging
# - SSL/TLS with production certificates
```

## Configuration Per Environment

| Setting | Local | Dev | Staging | Prod |
|---------|-------|-----|---------|------|
| Replicas | 1 | 2 | 3 | 5 |
| Log Level | debug | debug | info | warn |
| Resources | Minimal | Low | Medium | High |
| HPA Min | 1 | 2 | 3 | 5 |
| HPA Max | 1 | 10 | 10 | 20 |
| SSL/TLS | No | No | Yes | Yes |
| Namespace | default | my-app-dev | my-app-staging | my-app-prod |

## Troubleshooting

### Skaffold Issues

```bash
# Check Skaffold configuration
skaffold config list
skaffold diagnose

# View logs
skaffold dev --verbosity=debug

# Check what would be deployed
skaffold render
```

### Kubernetes Issues

```bash
# Check pods
kubectl get pods -n my-app-dev

# View pod logs  
kubectl logs -f deployment/my-app -n my-app-dev

# Check configuration
kubectl get configmap my-app-config -o yaml -n my-app-dev

# Test kustomize locally
kustomize build k8s/overlays/dev
```

### Application Issues

```bash
# Check health endpoints
curl http://localhost:8080/health
curl http://localhost:8080/ready

# View application info
curl http://localhost:8080/info

# Check API status
curl http://localhost:8080/api/status
```

## Next Steps

1. **Add Database**: Extend with PostgreSQL or MongoDB
2. **Add Tests**: Include unit and integration tests
3. **Add Monitoring**: Integrate Prometheus metrics
4. **Add Secrets**: Use Kubernetes secrets for sensitive data
5. **Add CI/CD**: Automate image building and testing
6. **Add Ingress**: Configure external access with ingress controllers

## Resources

- [Skaffold Documentation](https://skaffold.dev/docs/)
- [Flux Documentation](https://fluxcd.io/docs/)
- [Kustomize Documentation](https://kubectl.docs.kubernetes.io/guides/introduction/kustomize/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)