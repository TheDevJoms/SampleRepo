module Api
  class SessionsController < ApplicationController
    def create
      user = User.find_by(username: params[:username].to_s.strip)

      if user&.authenticate(params[:password].to_s)
        render json: {
          user: {
            id: user.id,
            username: user.username,
            role: user.role,
            status: user.status,
          }
        }, status: :ok
      else
        render_json_error("Invalid username or password", :unauthorized)
      end
    end
  end
end
