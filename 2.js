function Report() {
    this.trimPhoneNumber = function(value) {
        value = value.replace(/[^\d]/g, "");
        return value.length > 7 ? value.substr(0, 3) + " " + value.substr(3, 4) + " " + value.substr(7) : value.length > 3 ? value.substr(0, 3) + " " + value.substr(3) : value;
    }

    this.messagesShow = function(message) {
        if (this.canAnimate) {
            this.messageText.text(message);
            this.canAnimate = false;
            this.messageBox.stop(true).fadeIn(200).delay(1000).fadeOut(200, $.proxy(function() {
                this.canAnimate = true;
            }, this))
        }
        return false;
    }

    this.handleGetCode = function(res) {
        const {code} = res;
        if (code == 1) {
            return false;
        } else if (code == 2) {
            this.canGetCode = true;
            clearInterval(this.timer);
            this.messagesShow(this.ERROR.SENDCODEFAILED);
            this.getCode.text("再次发送").removeClass("active");
        } else {
            this.canGetCode = true;
            clearInterval(this.timer);
            this.messagesShow(this.ERROR.SENDCODEERROR);
            this.getCode.text("再次发送").removeClass("active");
        }
    }

    this.handleSubmit = function(res) {
        const {code} = res
        if (code == 1) {
            this.popup.show();
            this.body.addClass("active")
        } else if (code == 2) {
            this.messagesShow(this.ERROR.CAPTCHAERROR);
        } else if(code == 3) {
            this.messagesShow(this.ERROR.HAVENTCAR)
        }
    }
    
    this.handleRes = function(handle) {
        switch (handle) {
            case this.HANDLE.GETCODE: return $.proxy(this.handleGetCode, this);
            case this.HANDLE.SUBMIT: return $.proxy(this.handleSubmit, this);
            default: "";
        }
    }

    this.handleAjax = function(url, data, handle) {
        $.ajax({
            url: url,
            type: "POST",
            async: true,
            data: data,
            success: this.handleRes(handle)
        })
    }

    this.init = function() {
        this.HANDLE = {
            GETCODE: "getcode",
            SUBMIT: "submit"
        }
        this.ERROR = {
            SENDCODEFAILED: "发送失败",
            SENDCODEERROR: "发送错误",
            CAPTCHAERROR: "验证码错误",
            REASONERROR: "请选择举报原因",
            PHONEERROR: "请输入正确的手机号码",
            CODEERROR: "请填写验证码",
            HAVENTCAR: "车辆不存在"
        }
        this.url = location.protocol + "//" + location.host;
        this.ajaxInterface = {
            getCodeUrl: this.url + "/usedcar/ajaxSendSms",
            submitUrl: this.url + "/usedcar/AjaxCarReport"
            // getCodeUrl: "https://m.iautos.cn" + "/usedcar/ajaxSendSms"
        }
        
        this.checkPhone = new RegExp("^1\\d{10}$");
        this.timer = null;
        this.resetClassName = "";
        this.phone = "";
        this.canGetCode = true;
        this.data = null;
        this.historyBack = $(".return");
        this.messageBox = $(".message-box");
        this.canAnimate = true;
        this.messageText = $(".message-text");
        this.phoneBox = $(".phone-box");
        this.phoneInput = $("#phone");
        this.codeBox = $(".code-box");
        this.codeInput = $("#code");
        this.reset = $(".reset");
        this.resetPhone = $(".reset-phone");
        this.resetCode = $(".reset-code");
        this.getCode = $(".get-code");
        this.otherInput = $("#other");
        this.count = $(".count");
        this.submit = $("#report-submit");
        this.checkReason = $("input[name='reason']");
        this.reason = "";
        this.code = "";
        this.other = "";
        this.body = $("html, body");
        this.popup = $(".popup");
        this.popupClose = $(".popup-close");

        return this;
    }

    this.logic = function() {
        this.historyBack.on("click", function() {
            history.go(-1);
        })

        this.phoneInput.on("input", $.proxy(function() {
            this.phoneInput.val(this.trimPhoneNumber(this.phoneInput.val()));
            this.phoneInput.val().length > 0 ? this.resetPhone.show() : this.resetPhone.hide();
            this.phoneInput.val().length == 13 && this.codeBox.show() && this.phoneBox.addClass("active");
        }, this))

        this.codeInput.on("input", $.proxy(function() {
            this.codeInput.val().length > 0 ? this.resetCode.show() : this.resetCode.hide();
        }, this))

        this.reset.on("click", $.proxy(function(e) {
            this.resetClassName = $(e.target || e.srcElement).hide().attr("class");
            switch (this.resetClassName) {
                case "reset reset-phone": this.phoneInput.val(""); break;
                case "reset reset-code": this.codeInput.val(""); break;
                default: "";
            }
        }, this))

        this.getCode.on("click", $.proxy(function() {
            if (this.canGetCode) {
                this.phone = this.phoneInput.val().replace(/\s/g, "");
                if (this.checkPhone.test(this.phone)) {
                    this.canGetCode = false;
                    this.data = {
                        phone: this.phone
                    }
                    var s = 60;
                    this.getCode.text(s + "s后重发").addClass("active");
                    this.timer = setInterval(function() {
                        this.getCode.text(--s + "s后重发")
                        s == 0 && this.getCode.text("再次发送").removeClass("active") && (this.canGetCode = true) && clearInterval(this.timer);
                    }.bind(this), 1000)
                    this.handleAjax(this.ajaxInterface.getCodeUrl, this.data, this.HANDLE.GETCODE);  
                } else {
                    this.messagesShow(this.ERROR.PHONEERROR);
                }
            }
        }, this))

        this.otherInput.on("input", $.proxy(function() {
            this.count.text(this.otherInput.val().length);
        }, this))

        this.submit.on("click", $.proxy(function() {
            if (this.checkReason.is(":checked")) {
                this.reason = this.checkReason.filter(":checked").eq(0).val();
            } else {
                return this.messagesShow(this.ERROR.REASONERROR);
            }
            this.phone = this.phoneInput.val().replace(/\s/g, "");
            if (!this.checkPhone.test(this.phone)) {
                return this.messagesShow(this.ERROR.PHONEERROR);
            }
            this.code = this.codeInput.val();
            if (this.code == "") {
                return this.messagesShow(this.ERROR.CODEERROR)
            }
            this.other = this.otherInput.val();
            this.handleAjax(this.ajaxInterface.submitUrl, {
                car_id: "",
                cause: this.reason,
                phone: this.phone,
                captcha: this.code,
                content: this.other
            }, this.HANDLE.SUBMIT)
        }, this))

        this.popupClose.on("click", $.proxy(function() {
            this.popup.hide();
            this.body.removeClass("active");
        }, this))
    }
}

$(function() {
    new Report().init().logic();
})