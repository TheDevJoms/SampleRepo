module Api
  class MachinesController < ApplicationController
    before_action :require_admin!, only: [:create, :update, :destroy]

    def index
      render json: Machine.order(created_at: :desc)
    end

    def create
      machine = Machine.new(machine_params)

      if machine.save
        render json: machine, status: :created
      else
        render_json_error(machine.errors.full_messages.to_sentence, :unprocessable_entity)
      end
    end

    def update
      machine = Machine.find_by!(uid: params[:id])

      if machine.update(machine_params)
        render json: machine
      else
        render_json_error(machine.errors.full_messages.to_sentence, :unprocessable_entity)
      end
    rescue ActiveRecord::RecordNotFound
      render_json_error("Machine not found", :not_found)
    end

    def destroy
      machine = Machine.find_by!(uid: params[:id])
      machine.destroy
      head :no_content
    rescue ActiveRecord::RecordNotFound
      render_json_error("Machine not found", :not_found)
    end

    private

    def machine_params
      permitted = params.permit(:name, :serial_number, :model, :location, :status)
      nested = params[:machine].presence || {}

      if nested.respond_to?(:permit)
        nested_permitted = nested.permit(:name, :serial_number, :model, :location, :status)
        permitted = permitted.to_h.merge(nested_permitted.to_h)
      end

      permitted
    end
  end
end
