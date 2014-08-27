function draw_en_logo(target) {
        var r = Raphael(target, 600, 600),
            init = true,
            param = {stroke: "#fff", "stroke-width": 25},
            marksAttr = {fill: "#444", stroke: "none"};
        
        // let there be arcs
        r.customAttributes.arc = function (start_alpha, end_alpha, radius) {
            // compute start
            var start_a = (90 - start_alpha) * Math.PI / 180;
            var start_x = 300 + radius * Math.cos(start_a);
            var start_y = 300 - radius * Math.sin(start_a);
            // compute end
            var end_a = (90 - end_alpha) * Math.PI / 180;
            var end_x = 300 + radius * Math.cos(end_a);
            var end_y = 300 - radius * Math.sin(end_a);
            // svg path
            var path = [["M", start_x, start_y], ["A", radius, radius, 0, +((start_alpha-end_alpha) < 180), 1, end_x, end_y]];
            return {path: path};
        };
        
        // draw + color the relevant arcs!
        var outer = r.path().attr(param).attr({arc: [270, 0, 100]}).attr({stroke: "#6a737b"});                
        var inner = r.path().attr(param).attr({arc: [90, 0, 60]}).attr({stroke: "#26AAE1"});
        
        function updateVal(value, total, radius, hand, id) {
            if (init) {
                hand.animate({arc: [value, total, radius]}, 900, ">");
            } else {
                hand.animate({arc: [value, total, radius]}, 750, "elastic");
            }
        };
        
        function drawText() {
            var n_path = "M362.759,418.064h4.957v-22.303c0-8.711-6.145-13.869-15.08-13.869c-9.712,0-15.034,6.2-15.034,13.693 v22.479h4.957v-20.487c0-10.76,9.163-10.978,10.215-10.978c7.359,0,9.985,3.959,9.985,10.783V418.064";
            var e_path = "M375.052,400.676h29.601v-3.204c0-8.163-5.722-16.479-16.555-16.479c-10.3,0-17.623,7.934-17.623,18.462 c0,10.892,7.074,18.585,17.802,18.609v-4.129C377.711,413.854,375.052,404.474,375.052,400.676L375.052,400.676z M375.052,396.556 c0-1.831,2.823-11.442,12.816-11.442c6.79,0,12.206,5.187,12.206,11.442H375.052";
            var s_path = "M431.972,387.81c-2.282-4.64-6.922-6.389-11.865-6.389c-6.693,0-13.159,3.347-13.159,10.724 c0,6.77,6.693,8.747,9.128,9.355l4.868,1.142c3.727,0.912,6.77,2.13,6.77,5.704c0,4.107-4.26,5.933-8.366,5.933 c-4.185,0-7.303-2.13-9.356-5.323l-4.335,2.966c3.347,5.02,8.291,6.921,13.691,6.921c6.921,0,13.843-3.194,13.843-10.952 c0-5.021-3.728-8.595-8.671-9.736l-5.097-1.217c-4.64-1.064-6.997-2.281-6.997-5.628c0-3.803,3.879-5.324,7.378-5.324 c3.65,0,6.16,1.901,7.682,4.791L431.972,387.81";
            var t_path = "M440.909,407.251v-20.726h10.138v-4.506h-10.138v-8.83l-4.955,1.867v33.621c0,7.734,4.955,9.387,8.71,9.387 c2.479,0,4.882-0.45,6.684-1.276l-0.226-4.581c-1.502,0.826-3.379,1.352-5.106,1.352 C442.937,413.559,440.909,412.508,440.909,407.251";
            nest_path = n_path + e_path + s_path + t_path;
            
            fat_e_path = "M221.023,404.393v-2.518c0-12.74-6.942-19.911-17.165-19.911c-11.062,0-19.911,7.705-19.911,19.225 c0,11.157,8.323,18.67,18.896,19.136v-7.251c-5.062-0.046-9.136-3.302-9.741-8.681H221.023L221.023,404.393z M211.869,397.526 h-18.768c0.688-5.264,4.043-8.697,9.46-8.697C208.283,388.829,211.792,392.187,211.869,397.526";
            c_path = "M256.975,387.52c-3.501-3.882-8.6-5.557-13.243-5.557c-11.036,0-19.865,7.688-19.865,19.181 s8.829,19.181,19.865,19.181c3.196,0,9.438-1.37,13.168-5.1l-6.089-6.546c-1.675,2.208-4.264,3.425-7.079,3.425 c-6.698,0-10.731-5.252-10.731-10.96s4.033-10.96,10.731-10.96c2.436,0,4.796,1.446,6.927,3.653L256.975,387.52";
            h_path = "M268.539,373.107l-9.062,1.867v43.09h9.062v-19.785c0-4.833,2.341-9.213,8.307-9.213 c6.344,0,6.646,6.646,6.646,10.647v18.351h9.062v-22.881c0-7.401-3.474-14.272-13.216-14.272c-5.588,0-9.213,2.945-10.647,5.966 h-0.151V373.107";
            o_path = "M334.938,400.967c0-11.402-8.76-19.029-19.71-19.029c-10.949,0-19.709,7.627-19.709,19.029 c0,11.403,8.76,19.031,19.709,19.031C326.179,419.998,334.938,412.37,334.938,400.967L334.938,400.967z M325.876,400.967 c0,5.665-4.002,10.875-10.647,10.875s-10.647-5.21-10.647-10.875c0-5.663,4.002-10.874,10.647-10.874 S325.876,395.304,325.876,400.967";
            echo_path = fat_e_path + c_path + h_path + o_path;
            
            sideways_t_path = "M166.23,410.707h2.353v2.581h6.339c0.595,0,0.99-0.101,1.191-0.298c0.195-0.199,0.296-0.596,0.296-1.188 c0-0.2-0.009-0.39-0.026-0.57c-0.015-0.181-0.039-0.355-0.074-0.524h2.725c0.05,0.303,0.084,0.633,0.102,0.995 c0.016,0.362,0.024,0.719,0.024,1.063c0,0.548-0.04,1.062-0.114,1.55c-0.072,0.486-0.218,0.915-0.432,1.287 c-0.216,0.372-0.52,0.665-0.915,0.881c-0.397,0.212-0.919,0.32-1.56,0.32h-7.556v2.131h-2.353v-2.131h-2.929l-0.911-3.516h3.84 V410.707z";
            sideways_h_path = "M162.261,405.758h5.751v-0.073c-0.744-0.448-1.282-1.016-1.621-1.71c-0.339-0.69-0.508-1.372-0.508-2.03 c0-0.94,0.127-1.712,0.385-2.319c0.255-0.599,0.609-1.075,1.064-1.421c0.453-0.347,1.007-0.59,1.658-0.73 c0.653-0.14,1.376-0.211,2.168-0.211h7.875v3.52h-7.23c-1.058,0-1.848,0.163-2.365,0.493c-0.521,0.33-0.781,0.914-0.781,1.756 c0,0.96,0.285,1.655,0.855,2.082c0.57,0.43,1.507,0.645,2.811,0.645h6.711v3.519h-15.861L162.261,405.758z";
            sideways_e_path = "M175.963,392.062c0.512-0.527,0.767-1.288,0.767-2.279c0-0.709-0.176-1.32-0.531-1.831 c-0.354-0.513-0.73-0.827-1.128-0.942v-3.098c1.537,0.494,2.635,1.257,3.293,2.279c0.662,1.024,0.992,2.262,0.992,3.713 c0,1.01-0.158,1.918-0.482,2.728c-0.322,0.808-0.779,1.493-1.375,2.056c-0.595,0.56-1.305,0.998-2.129,1.299 c-0.827,0.307-1.734,0.461-2.724,0.461c-0.96,0-1.853-0.16-2.675-0.473c-0.826-0.314-1.541-0.758-2.144-1.337 c-0.604-0.578-1.078-1.269-1.425-2.07c-0.348-0.8-0.52-1.688-0.52-2.663c0-1.086,0.209-2.037,0.632-2.847 c0.421-0.808,0.985-1.473,1.696-1.991c0.707-0.52,1.518-0.897,2.428-1.127c0.906-0.231,1.857-0.313,2.848-0.248v9.237 C174.627,392.879,175.449,392.589,175.963,392.062z M169.229,388.086c-0.465,0.421-0.695,1.062-0.695,1.922 c0,0.562,0.093,1.024,0.285,1.398c0.188,0.368,0.424,0.667,0.705,0.893c0.283,0.221,0.576,0.379,0.893,0.469 c0.312,0.091,0.594,0.145,0.842,0.161v-5.721C170.366,387.371,169.689,387.666,169.229,388.086z";
            the_path = sideways_t_path + sideways_h_path + sideways_e_path;
            
            r.path(the_path).attr({stroke: "#6A737B", fill: "#6A737B", opacity: 0}).scale(2,2).translate(-158,85).animate({opacity: 1}, 1000 );                    
            r.path(echo_path).attr({stroke: "#6A737B", fill: "#6A737B", opacity: 0}).scale(2,2).translate(-70,80).animate({opacity: 1}, 1000 );
            r.path(nest_path).attr({stroke: "#26AAE1", fill: "#26AAE1", opacity: 0}).scale(2,2).translate(70,80).animate({opacity: 1}, 1000 );
        }
        drawText();
        updateVal(180, 90, 100, outer, 1);
        updateVal(270, 90, 60, inner, 2);
    };