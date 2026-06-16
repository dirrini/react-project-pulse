# ProjectPulse Kubernetes Deployment

This folder contains a first production-oriented Kubernetes setup for ProjectPulse.

## Layout

- `base/`: cloud-neutral namespace, config, deployments, services, and Prisma migration job.
- `aws/`: EKS overlay with AWS Load Balancer Controller ingress and ECR image names.

## Before Applying

Replace placeholders in:

- `k8s/base/configmap.yaml`
  - `CORS_ORIGIN`
- `k8s/aws/ingress.yaml`
  - hostnames
  - ACM certificate ARN
- `k8s/aws/kustomization.yaml`
  - AWS account id
  - image tags

Create the production secret manually or with your secret manager:

```bash
kubectl create secret generic projectpulse-secrets \
  --namespace projectpulse \
  --from-literal=DATABASE_URL='postgresql://USER:PASSWORD@HOST:5432/projectpulse' \
  --from-literal=AUTH_SECRET='replace-with-a-long-random-secret'
```

Do not commit real secret values.

## Build Images

```bash
docker build -t projectpulse-api:latest ./backend
docker build \
  --build-arg VITE_API_URL=https://api.projectpulse.example.com/graphql \
  -t projectpulse-web:latest \
  ./frontend
```

For EKS, tag and push these images to ECR, then update `k8s/aws/kustomization.yaml`.

## Deploy

```bash
kubectl apply -f k8s/base/namespace.yaml
kubectl apply -f k8s/base/secret.example.yaml # only for local testing; replace values first
kubectl apply -k k8s/aws
```

For production, prefer creating the secret from AWS Secrets Manager or a CI/CD secret store instead of applying `secret.example.yaml`.

## Run Migrations

The base includes a `projectpulse-migrate` Job. For repeat deployments, delete and recreate it when you need to run migrations again:

```bash
kubectl delete job projectpulse-migrate -n projectpulse --ignore-not-found
kubectl apply -k k8s/aws
kubectl logs job/projectpulse-migrate -n projectpulse
```

## Useful Checks

```bash
kubectl get pods -n projectpulse
kubectl get ingress -n projectpulse
kubectl logs deploy/projectpulse-api -n projectpulse
kubectl describe ingress projectpulse -n projectpulse
```
