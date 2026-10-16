class ApplicationController < ActionController::API
  private

  def render_json_error(message, status = :unprocessable_entity)
    render json: { error: message }, status: status
  end
end
