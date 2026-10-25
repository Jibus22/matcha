{
  description = "matcha development shell";

  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";

  outputs =
    { nixpkgs, ... }:
    let
      systems = [
        "aarch64-darwin"
        "x86_64-darwin"
        "aarch64-linux"
        "x86_64-linux"
      ];
      forAllSystems = f: nixpkgs.lib.genAttrs systems (system: f nixpkgs.legacyPackages.${system});
    in
    {
      devShells = forAllSystems (pkgs: {
        default = pkgs.mkShell {
          packages = with pkgs; [
            go
            gleam
            beam28Packages.erlang
            beam28Packages.rebar3
            nodejs_24
            pnpm
            opam # owns the OCaml compiler and libraries, in a local switch per service
            pkg-config
            k3d
            tilt
            kubernetes-helm
            kubectl
            just
          ];
          # C libraries opam compiles OCaml libraries against (caqti's Postgres driver, zarith, TLS).
          # buildInputs, not packages, so the compiler wrapper and pkg-config see their headers.
          buildInputs = with pkgs; [
            libpq
            gmp
            openssl
          ];
        };
      });
    };
}
