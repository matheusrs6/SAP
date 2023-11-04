sap.ui.define([
	"./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/routing/History",
    "../model/formatter"
], function(BaseController, JSONModel, History, formatter) {
	"use strict";

	return BaseController.extend("portfolio.cadastrodeprojetos.controller.Create", {

        formatter: formatter,

        /* =========================================================== */
        /* lifecycle methods                                           */
        /* =========================================================== */

        /**
         * Called when the create controller is instantiated.
         * @public
         */
        onInit : function () {

            
        },
        resetFields: function() {
            this.byId("nome").setValue("");
            this.byId("tipo").setSelectedKey("0");
            this.byId("detalhes").setValue("");
            this.byId("DataInicioInput").setValue("");
            this.byId("DataFimInput").setValue("");
        },
        onNavBack: function () {

            var oHistory = History.getInstance();
            var sPreviousHash = oHistory.getPreviousHash();

            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                var oRouter = UIComponent.getRouterFor(this);
                oRouter.navTo("worklist", {}, true);
            }

        },
        onGravar: function () {
            var oModel = this.getView().getModel();

            var dataInicio = this.byId("DataInicioInput").getValue();
            var dataFim = this.byId("DataFimInput").getValue();
            var status;

            if (dataInicio.length > 0) {
                // dd/mm/yyyy
                dataInicio = dataInicio.substring(6, 10)+'-'+
                             dataInicio.substring(3, 5) +'-'+
                             dataInicio.substring(0, 2)+
                             "T00:00:00";
            } else {
                dataInicio = null;
            }

            if (dataFim.length > 0) {
                // dd/mm/yyyy
                dataFim = dataFim.substring(6, 10)+'-'+
                          dataFim.substring(3, 5) +'-'+
                          dataFim.substring(0, 2)+
                          "T00:00:00";
                status = "F";
            } else {
                dataFim = null;
                status = "A";
            }

            var dados = {
                Nome: this.byId("nome").getValue(),
                Tipo: this.byId("tipo").getSelectedKey(),
                Descricao: this.byId("detalhes").getValue(),
                DataInicio: dataInicio,
                DataFim: dataFim,
                Status: status
            };

            oModel.create("/ProjetoSet", dados, {
                success: function (dados, resposta) {

                    //sap.m.MessageToast.show('Projeto criado com sucesso.');
                    var mensagem = JSON.parse(resposta.headers["sap-message"]);
                    this.resetFields();
                    this.getRouter().navTo("worklist", {});

                }.bind(this),
                error: function (e) {
                    console.error(e);
                }.bind(this)
            });
        },
        onCancelar: function() {
            this.resetFields();
            this.getRouter().navTo("worklist", {});
        }
    });
});