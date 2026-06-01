function check(){
                var name = ($("#name").val() || "shortcut").trim();
                var url = ($("#url").val() || "").trim();
                if(!name){ alert("请输入快捷方式名称"); return; }
                if(!/^https?:\/\//i.test(url)){ alert("请输入以 http:// 或 https:// 开头的网址"); return; }
                var safeName = name.replace(/[\\/:*?"<>|]/g, "-").replace(/\s+/g, " ").trim() || "shortcut";
                var content = "[InternetShortcut]\r\nURL=" + url + "\r\n";
                var blob = new Blob([content], {type: "application/octet-stream"});
                var a = document.createElement("a");
                a.href = URL.createObjectURL(blob);
                a.download = safeName + ".url";
                document.body.appendChild(a);
                a.click();
                setTimeout(function(){ URL.revokeObjectURL(a.href); a.remove(); }, 0);
            }
