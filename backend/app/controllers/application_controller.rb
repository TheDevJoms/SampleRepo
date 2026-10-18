class ApplicationController < ActionController::API
  before_action :authenticate_request!, unless: :public_route?

  private

  def public_route?
    request.path == "/login" || request.path == "/up"
  end

  def authenticate_request!
    auth_header = request.headers["Authorization"].to_s
    username = auth_header.sub(/\ABearer\s+/i, "").strip

    if username.blank?
      render_json_error("Authentication required", :unauthorized)
      return
    end

    @current_user = User.find_by(username: username)

    if @current_user.nil? || @current_user.status != "active"
      render_json_error("Invalid authentication", :unauthorized)
      return
    end
  end

  def current_user
    @current_user
  end

  def require_admin!
    return if current_user&.role == "admin"

    render_json_error("Admin access required", :forbidden)
  end

  def render_json_error(message, status = :unprocessable_entity)
    render json: { error: message }, status: status
  end
end
