module Api
  class SuppliesController < ApplicationController
    def index
      render json: Supply.order(created_at: :desc)
    end

    def create
      supply = Supply.new(supply_params)

      if supply.save
        render json: supply, status: :created
      else
        render_json_error(supply.errors.full_messages.to_sentence, :unprocessable_entity)
      end
    end

    def update
      supply = Supply.find_by!(uid: params[:id])

      if supply.update(supply_params)
        render json: supply
      else
        render_json_error(supply.errors.full_messages.to_sentence, :unprocessable_entity)
      end
    rescue ActiveRecord::RecordNotFound
      render_json_error("Supply not found", :not_found)
    end

    def destroy
      supply = Supply.find_by!(uid: params[:id])
      supply.destroy
      head :no_content
    rescue ActiveRecord::RecordNotFound
      render_json_error("Supply not found", :not_found)
    end

    private

    def supply_params
      permitted = params.permit(:name, :quantity, :unit, :reorder_level, :status, :date_received)
      nested = params[:supply].presence || {}

      if nested.respond_to?(:permit)
        nested_permitted = nested.permit(:name, :quantity, :unit, :reorder_level, :status, :date_received)
        permitted = permitted.to_h.merge(nested_permitted.to_h)
      end

      permitted
    end
  end
end
