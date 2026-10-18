Rails.application.config.middleware.insert_before 0, Rack::Cors do
  default_origins = %w[
    http://localhost:5173
    http://127.0.0.1:5173
    http://localhost:5174
    http://127.0.0.1:5174
    http://localhost:5175
    http://127.0.0.1:5175
    http://localhost:5176
    http://127.0.0.1:5176
    http://localhost:5177
    http://127.0.0.1:5177
  ]

  allowed_origins = ENV.fetch("CORS_ORIGINS", default_origins.join(",")).split(",").map(&:strip).reject(&:empty?)

  allow do
    origins(*allowed_origins)

    resource "*",
      headers: :any,
      methods: [:get, :post, :put, :patch, :delete, :options, :head],
      credentials: false
  end
end
