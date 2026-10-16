Rails.application.routes.draw do
  post "/login", to: "api/sessions#create"

  namespace :api do
    get "/dashboard", to: "dashboard#index"
    resources :supplies, only: [:index, :create, :update, :destroy]
    resources :machines, only: [:index, :create, :update, :destroy]
    resources :users, only: [:index, :create, :update, :destroy]
  end

  get "up" => "rails/health#show", as: :rails_health_check
end
