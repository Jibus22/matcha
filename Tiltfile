# The local dev loop. `just up` starts it; http://localhost:10350 shows it.

# The CloudNativePG operator, from its official chart. Plain helm rather than Tilt's helm
# extension, which Tilt would download from GitHub at runtime.
local_resource(
    'cnpg-operator',
    cmd='helm upgrade --install cnpg oci://ghcr.io/cloudnative-pg/charts/cloudnative-pg'
    + ' --version 0.29.1 --namespace cnpg-system --create-namespace --wait',
    labels=['platform'],
)
