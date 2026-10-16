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
      supply = Supply.find(params[:id])

      if supply.update(supply_params)
        render json: supply
      else
        render_json_error(supply.errors.full_messages.to_sentence, :unprocessable_entity)
      end
    rescue ActiveRecord::RecordNotFound
      render_json_error("Supply not found", :not_found)
    end

    def destroy
      supply = Supply.find(params[:id])
      supply.destroy
      head :no_content
    rescue ActiveRecord::RecordNotFound
      render_json_error("Supply not found", :not_found)
    end

    private

    def supply_params
      params.permit(:name, :quantity, :unit, :reorder_level, :status)
    end
  end
end
