let auth =
  Dream.scope "/auth" []
    [
      Dream.get "/signin" (fun _ ->
          `Assoc [ ("route", `String "signin") ]
          |> Yojson.Basic.to_string |> Dream.json);
      Dream.get "/signup" (fun _ ->
          let json_string =
            `Assoc [ ("route", `String "signup") ] |> Yojson.Basic.to_string
          in
          Dream.json json_string);
      Dream.get "/logout" (fun _ ->
          let json_string =
            `Assoc [ ("route", `String "logout") ] |> Yojson.Basic.to_string
          in
          Dream.json json_string);
    ]

let users =
  Dream.scope "/users" []
    [
      Dream.get "/" (fun _ ->
          Dream.respond
            ~headers:[ ("Content-Type", "application/json") ]
            "users");
      Dream.get "/:id" (fun request ->
          let id = Dream.param request "id" in
          Dream.respond
            ~headers:[ ("Content-Type", "application/json") ]
            ("user id: " ^ id));
    ]

let v1 =
  Dream.scope "/v1" []
    [
      Dream.post "/echo" (fun request ->
          let%lwt body = Dream.body request in
          Dream.respond
            ~headers:[ ("Content-Type", "application/octet-stream") ]
            body);
      Dream.post "/okay" (fun request ->
          let%lwt body = Dream.body request in
          Dream.respond
            ~headers:[ ("Content-Type", "application/octet-stream") ]
            (body ^ "okay"));
      auth;
      users;
    ]

let api = Dream.scope "/api" [] [ v1 ]
let () = Dream.run @@ Dream.logger @@ Dream.router [ api ]
