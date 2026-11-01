# The local dev loop. `just up` starts it; http://localhost:10350 shows it.

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
# `kubectl wait` can, so whatever depends on `postgres` starts once it accepts connections.
local_resource(
    'postgres',
    cmd='kubectl apply -f dev/postgres.yaml'
    + ' && kubectl wait cluster/matcha-pg -n matcha --for=condition=Ready --timeout=5m',
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

# Traefik sends its traces and metrics to that collector, so every request's trace starts at
# the edge.
k8s_yaml('dev/traefik.yaml')
k8s_resource(
    new_name='traefik-otlp',
    objects=['traefik:helmchartconfig'],
    resource_deps=['otel-lgtm'],
    labels=['observability'],
)
