module Api
  class UsersController < ApplicationController
    def index
      render json: User.order(created_at: :desc)
    end

    def create
      user = User.new(user_params)

      if user.save
        render json: user, status: :created
      else
        render_json_error(user.errors.full_messages.to_sentence, :unprocessable_entity)
      end
    end

    def update
      user = User.find_by!(uid: params[:id])
      permitted_params = user_params

      if permitted_params[:password].blank?
        permitted_params = permitted_params.except(:password)
      end

      if user.update(permitted_params)
        render json: user
      else
        render_json_error(user.errors.full_messages.to_sentence, :unprocessable_entity)
      end
    rescue ActiveRecord::RecordNotFound
      render_json_error("User not found", :not_found)
    end

    def destroy
      user = User.find_by!(uid: params[:id])
      user.destroy
      head :no_content
    rescue ActiveRecord::RecordNotFound
      render_json_error("User not found", :not_found)
    end

    private

    def user_params
      permitted = params.permit(:username, :password, :role, :status)
      nested = params[:user].presence || {}

      if nested.respond_to?(:permit)
        nested_permitted = nested.permit(:username, :password, :role, :status)
        permitted = permitted.to_h.merge(nested_permitted.to_h)
      end

      permitted
    end
  end
end
