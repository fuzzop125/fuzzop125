/*!
* Start Bootstrap - New Age v6.0.6 (https://startbootstrap.com/theme/new-age)
* Copyright 2013-2022 Start Bootstrap
* Licensed under MIT (https://github.com/StartBootstrap/startbootstrap-new-age/blob/master/LICENSE)
*/
//
// Scripts
// 
var listOfUrls = [];
var baseUrl = "https://app.fuzzop.com";
var jsonUrl = "/json/";
window.addEventListener('DOMContentLoaded', event => {

    // Activate Bootstrap scrollspy on the main nav element
    const mainNav = document.body.querySelector('#mainNav');
    if (mainNav) {
        new bootstrap.ScrollSpy(document.body, {
            target: '#mainNav',
            offset: 74,
        });
    };

    // Collapse responsive navbar when toggler is visible
    const navbarToggler = document.body.querySelector('.navbar-toggler');
    const responsiveNavItems = [].slice.call(
        document.querySelectorAll('#navbarResponsive .nav-link')
    );
    responsiveNavItems.map(function (responsiveNavItem) {
        responsiveNavItem.addEventListener('click', () => {
            if (window.getComputedStyle(navbarToggler).display !== 'none') {
                navbarToggler.click();
            }
        });
    });

    var editor = ace.edit("editor");
    editor.setTheme("ace/theme/monokai");
    editor.session.setMode("ace/mode/json");

    var list = localStorage.getItem("list");
    try {
        listOfUrls = JSON.parse(list);
        if (listOfUrls.length) {
            $("#previous-jsons").show();
            refreshList(listOfUrls);
        }
    } catch {
        localStorage.removeItem("list");
    }

    $('#previous-jsons-select').on('change', function() {
        var selected = $(this).find(":selected").val();
        var editor = ace.edit("editor");
        listOfUrls.forEach(function(ele) {
            if (ele.path == selected) {
                editor.setValue(JSON.stringify(ele.data));
            }
        });

        $('#previous-jsons-link').html("<a href='" + baseUrl + jsonUrl + selected + "'>Link to above JSON<a/>");
    });
});

$("#editor-submit").click(function(event) {
    event.preventDefault();
    var editor = ace.edit("editor");
    errors = editor.getSession().getAnnotations();
    if (errors.length) {
        alert("Error Found \n" + "Line: " + errors[0].column + " Error: " + errors[0].text);
        return false;
    }
    var value = editor.getValue();
    if (!value) {
        alert("Error \n" + "Please enter valid JSON");
        return false;
    }
    url = "/store-json";
    $.ajax({
        type: "POST",
        url: baseUrl + url,
        contentType: 'application/json',
        dataType: 'json',
        data: JSON.stringify({data: JSON.parse(value)}),
        success: function(data) {
            alert("Your JSON is hosted at " + baseUrl + jsonUrl + data.path);
            var t = new Date();
            t.setHours(t.getHours() + 12);
            t = Math.floor(+t/1000);
            listOfUrls.push({path: data.path, data: data.data, expire_at: t});
            refreshList(listOfUrls);
        },
        error: function(data) {
            alert(JSON.stringify(data));
        }
    });
});

function refreshList(list) {
    localStorage.setItem('list', JSON.stringify(list));
    $('#previous-jsons-select').empty();
    let t = Math.floor(+new Date()/1000);
    $.each(list, function(key, ele) {
        if (ele.expire_at > t) {
            $("#previous-jsons").show();
            $('#previous-jsons-select')
                .append($("<option></option>")
                .attr("value", ele.path)
                .text(ele.path + " : " + JSON.stringify(ele.data).substr(0, 30)));
        }
    });

    let newList = $.grep(list, function(l) {
        return (l.expire_at > t);
    });

    if (newList.length == 1) {
        $('#previous-jsons-link').html("<a href='" + baseUrl + jsonUrl + newList[0].path + "'>Link to above JSON<a/>");
    }

    localStorage.setItem('list', JSON.stringify(newList));
}
