sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/routing/History",
    "../model/formatter"
], function (BaseController, JSONModel, History, formatter) {
    "use strict";

    return BaseController.extend("portfolio.cadastrodeprojetos.controller.Object", {

        formatter: formatter,

        /* =========================================================== */
        /* lifecycle methods                                           */
        /* =========================================================== */

        /**
         * Called when the object controller is instantiated.
         * @public
         */
        onInit : function () {
            // Model used to manipulate control states. The chosen values make sure,
            // detail page shows busy indication immediately so there is no break in
            // between the busy indication for loading the view's meta data
            var oViewModel = new JSONModel({
                    busy : true,
                    delay : 0
                });
            this.getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched, this);
            this.setModel(oViewModel, "objectView");
        },
        onGravar:function(){

			var oModel = this.getView().getModel();
			var path = this.getView().getBindingContext().getPath();

            var dataInicio = this.byId("DataInicioInput").getValue();
            var dataFim = this.byId("DataFimInput").getValue();
            var status;

            if (dataInicio.length > 0) {
                // dd/mm/yyyy
                dataInicio = dataInicio.substring(6, 10)+'-'+
                             dataInicio.substring(3, 5) +'-'+
                             dataInicio.substring(0, 2)+
                             "T00:00:00"
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

			var obj = {
				Nome: this.byId("nome").getValue(),
				Tipo: this.byId("tipo").getSelectedKey(),
				Descricao: this.byId("detalhes").getValue(),
				DataInicio: dataInicio,
                DataFim: dataFim,
				Status: status	
			};

			//atualização
			oModel.update(path, obj, {
				success: function(){
					//sap.m.MessageToast.show('Projeto alterado com sucesso.');
                    this.getRouter().navTo("worklist", {});
				}.bind(this),
				error: function(e){
					console.error(e);
				}.bind(this)
			});
		},
        onCancelar: function (oEvent) {
            this.getView().getModel().resetChanges();
            this.getRouter().navTo("worklist", {});
		},
        onExcluirProjeto: function(oEvent) {
            var oModel = this.getView().getModel();
			var sPath = this.getView().getBindingContext().getPath();

			oModel.remove(sPath, {
				success: function(){
					//sap.m.MessageToast.show('Projeto excluído com sucesso.');
                    this.getRouter().navTo("worklist", {});
				}.bind(this),
				error: function(e){
					console.error(e);
				}.bind(this)
	  
			});
        },
        /* =========================================================== */
        /* event handlers                                              */
        /* =========================================================== */


        /**
         * Event handler  for navigating back.
         * It there is a history entry we go one step back in the browser history
         * If not, it will replace the current entry of the browser history with the worklist route.
         * @public
         */
        onNavBack : function() {
            var sPreviousHash = History.getInstance().getPreviousHash();
            if (sPreviousHash !== undefined) {
                // eslint-disable-next-line fiori-custom/sap-no-history-manipulation
                history.go(-1);
            } else {
                this.getRouter().navTo("worklist", {}, true);
            }
        },

        /* =========================================================== */
        /* internal methods                                            */
        /* =========================================================== */

        /**
         * Binds the view to the object path.
         * @function
         * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
         * @private
         */
        _onObjectMatched : function (oEvent) {
            var sObjectId =  oEvent.getParameter("arguments").objectId;
            this._bindView("/ProjetoSet" + sObjectId);
        },

        /**
         * Binds the view to the object path.
         * @function
         * @param {string} sObjectPath path to the object to be bound
         * @private
         */
        _bindView : function (sObjectPath) {
            var oViewModel = this.getModel("objectView");
            this.getView().bindElement({
                path: sObjectPath,
                events: {
                    change: this._onBindingChange.bind(this),
                    dataRequested: function () {
                        oViewModel.setProperty("/busy", true);
                    },
                    dataReceived: function () {
                        oViewModel.setProperty("/busy", false);
                    }
                }
            });
        },

        _onBindingChange : function () {
            var oView = this.getView(),
                oViewModel = this.getModel("objectView"),
                oElementBinding = oView.getElementBinding();

            // No data for the binding
            if (!oElementBinding.getBoundContext()) {
                this.getRouter().getTargets().display("objectNotFound");
                return;
            }

            var oResourceBundle = this.getResourceBundle(),
                oObject = oView.getBindingContext().getObject(),
                sObjectId = oObject.Nome,
                sObjectName = oObject.ProjetoSet;

                oViewModel.setProperty("/busy", false);
                oViewModel.setProperty("/shareSendEmailSubject",
                    oResourceBundle.getText("shareSendEmailObjectSubject", [sObjectId]));
                oViewModel.setProperty("/shareSendEmailMessage",
                    oResourceBundle.getText("shareSendEmailObjectMessage", [sObjectName, sObjectId, location.href]));
        }
    });

});
