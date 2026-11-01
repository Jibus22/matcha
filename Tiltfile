# The local dev loop. `just up` starts it; http://localhost:10350 shows it.

# Tilt downloads its extensions from GitHub on first use: pin them to one commit.
v1alpha1.extension_repo(
    name='default',
    url='https://github.com/tilt-dev/tilt-extensions',
    ref='bbc1fee687523dbb2d7bd0c648d12c8a50d06ca6',
)
load('ext://restart_process', 'docker_build_with_restart')

# The CloudNativePG operator, from its official chart. Plain helm rather than Tilt's helm
# extension, which Tilt would download from GitHub at runtime.
local_resource(
    'cnpg-operator',
    cmd='helm upgrade --install cnpg oci://ghcr.io/cloudnative-pg/charts/cloudnative-pg'
    + ' --version 0.29.1 --namespace cnpg-system --create-namespace --wait',
    labels=['platform'],
)

# Postgres with PostGIS, run by the operator. A local_resource rather than k8s_yaml: Tilt can't
# read a CNPG Cluster's readiness (it marks it ready before the database pod even exists), but
# `kubectl wait` can, so whatever depends on `postgres` starts once it accepts connections and
# each service's database exists.
local_resource(
    'postgres',
    cmd='kubectl apply -f dev/postgres.yaml'
    + ' && kubectl wait cluster/matcha-pg -n matcha --for=condition=Ready --timeout=5m'
    + ' && kubectl wait database/auth -n matcha --for=jsonpath={.status.applied}=true --timeout=2m',
    deps=['dev/postgres.yaml'],
    resource_deps=['cnpg-operator'],
    labels=['platform'],
)

# Grafana with Tempo, Loki and Prometheus behind it, and the OTLP collector services send to.
# A plain Deployment, so Tilt reads its readiness itself.
k8s_yaml('dev/otel-lgtm.yaml')
k8s_resource(
    'otel-lgtm',
    objects=['observability:namespace'],
    port_forwards=[port_forward(3000, 3000, name='Grafana')],
    labels=['observability'],
)

# Container logs: the OpenTelemetry Collector chart, one collector per node, plain helm like CNPG.
local_resource(
    'otel-collector',
    cmd='helm upgrade --install otel-collector'
    + ' oci://ghcr.io/open-telemetry/opentelemetry-helm-charts/opentelemetry-collector'
    + ' --version 0.178.1 --namespace observability -f dev/otel-collector.yaml --wait',
    deps=['dev/otel-collector.yaml'],
    resource_deps=['otel-lgtm'],
    labels=['observability'],
)

# Traefik sends its traces and metrics to that collector, so every request's trace starts at
# the edge.
k8s_yaml('dev/traefik.yaml')
k8s_resource(
    new_name='traefik-otlp',
    objects=['traefik:helmchartconfig'],
    resource_deps=['otel-lgtm'],
    labels=['observability'],
)

# Mailpit: catches the emails services send; its inbox is on http://localhost:8025.
k8s_yaml('dev/mailpit.yaml')
k8s_resource(
    'mailpit',
    port_forwards=[port_forward(8025, 8025, name='Mailpit')],
    resource_deps=['postgres'],  # postgres creates the matcha namespace
    labels=['platform'],
)

# auth (Go). Compiled on the Mac for Linux, then synced into the running container, which
# restarts the program: an edit never rebuilds the image. Kubernetes can't restart one
# container in place, hence restart_process, which wraps the program's start command.
local_resource(
    'auth-compile',
    cmd='cd auth && CGO_ENABLED=0 GOOS=linux go build -o build/auth .',
    deps=['auth'],
    ignore=['auth/build'],
    labels=['auth'],
)
docker_build_with_restart(
    'matcha-auth',
    'auth',
    dockerfile_contents='FROM alpine:3.24\nCOPY build/auth /app/auth\n',
    only=['build'],
    entrypoint=['/app/auth'],
    live_update=[sync('auth/build', '/app')],
)
k8s_yaml(helm('charts/service', name='auth', namespace='matcha', values=['auth/values.yaml']))
k8s_resource(
    'auth',
    objects=['auth:ingressroute'],
    resource_deps=['auth-compile', 'postgres'],  # postgres also creates the matcha namespace
    labels=['auth'],
)
