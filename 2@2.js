function Report() {
    this.init = function() {
        this.HANDLE = {
            GETCODE: "getcode",
            SUBMIT: "submit"
        }
        this.ERROR = {
            REASONERROR: "请选择举报原因",
            PHONEERROR: "请输入正确的手机号码",
            CODEERROR: "请填写验证码"
        }
        this.checkPhone = new RegExp("^1\\d{10}$");
        this.timer = null;
        this.resetClassName = "";
        this.phone = "";
        this.canGetCode = true;
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
            this.phone = this.phoneInput.val().replace(/\s/g, "");
            this.checkPhone.test(this.phone) ? /* this.handleAjax(url, {phone: this.phone}, this.HANDLE.GETCODE) */ this.handleRes(this.HANDLE.GETCODE)() : this.canGetCode && this.messagesShow(this.ERROR.PHONEERROR);
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
            /* this.handleAjax(url, {
                reason: this.reason,
                phone: this.phone,
                code: this.code,
                other: this.other
            }, this.HANDLE.SUBMIT) */
            this.handleRes(this.HANDLE.SUBMIT)();
        }, this))

        this.popupClose.on("click", $.proxy(function() {
            this.popup.hide();
            this.body.removeClass("active");
        }, this))
    }
}
const methods = {
    trimPhoneNumber: function(value) {
        value = value.replace(/[^\d]/g, "");
        return value.length > 7 ? value.substr(0, 3) + " " + value.substr(3, 4) + " " + value.substr(7) : value.length > 3 ? value.substr(0, 3) + " " + value.substr(3) : value;
    },
    messagesShow: function(message) {
        if (this.canAnimate) {
            this.messageText.text(message);
            this.canAnimate = false;
            this.messageBox.stop(true).fadeIn(200).delay(1000).fadeOut(200, $.proxy(function() {
                this.canAnimate = true;
            }, this))
        }
        return false;
    },
    handleGetCode: function(res) {
        if(this.canGetCode) {
            var s = 60;
            this.canGetCode = false;
            this.getCode.text(s + "s后重发").addClass("active");
            this.timer = setInterval(function() {
                this.getCode.text(--s + "s后重发")
                s == 0 && this.getCode.text("再次发送").removeClass("active") && (this.canGetCode = true) && clearInterval(this.timer);
            }.bind(this), 1000)
        }
    },
    handleSubmit: function(res) {
        if (true) {
            this.popup.show();
            this.body.addClass("active")
        }
    },
    handleRes: function(handle) {
        switch (handle) {
            case this.HANDLE.GETCODE: return $.proxy(this.handleGetCode, this);
            case this.HANDLE.SUBMIT: return $.proxy(this.handleSubmit, this);
            default: "";
        }
    },
    handleAjax: function(url, data, handle) {
        $.ajax({
            url: url,
            type: "POST",
            async: true,
            data: data,
            success: this.handleRes(handle)
        })
    }
}
Report.prototype = Object.assign(Report.prototype, methods)

$(function() {
    new Report().init().logic();
})