# AIGC 制作笔记

## 先固定因果，再写台词

写作约束（整理自制作过程）：

> 写一部设在虚构河镇的中文三幕洪水悬疑短片。值班员许遥只有一个可用的频段。第一次选择决定哪一队被优先救援，第二次决定立刻淹掉旧街，或冒险操作挡板来保住旧街。两次抉择组合成四条结局。每条都要交代孩子、堤下居民、旧街和许遥此后的生活。把可帮助判断的信息放到决定之前，避免角色直接讲出正确答案。

先让两次决定落在不同的代价上：第一个决定改变谁先得到救援，第二个决定用什么代价争取时间。随后用同一个广播值班室串起两条线路。闸门前读取第一幕的选择，给出不同回执。最终结局由两个决定共同选出；浏览器执行的是可以逐条测试的剧情图。

统一用粉笔刻度、湿旗、广播回执呈现水位和时间。弟弟的录音不是解谜道具，它解释许遥为什么难以下决定。四种尾声各有具体的行动和后果，故事到此结束。

## 分镜生成

实际生成给 ImageGen 的指令：

> Create a single 2x2 contact sheet, exactly equal-size quadrants and absolutely no gutters, dividers, text, signage, letters or watermarks. Four independent cinematic widescreen film stills in the quadrants (not continuous). Original fictional East Asian riverside town during an extreme flood, mature 35mm analog drama, rain, deep navy/teal, ember-orange practical lighting, moody cinematic color grading, readable forms and beautiful realistic cinematography. Upper left: close wide landscape of old concrete municipal radio tower above flooded streets at blue hour, amber lamp in the tower, no people. Upper right: interior old radio dispatch room with vintage tactile radio desk, amber oscilloscope and one short-haired East Asian woman in rust-orange waterproof coat in silhouette looking at console, no text. Lower left: low angle view of an underground flooded sluice tunnel, red ladder, turbulent silver water, no people. Lower right: dawn sunrise over floating rescue boats and rooftops of the fictional town, one small warm signal light, subtle uplifting daylight. Keep subjects away from shared edges. 3:2 overall landscape aspect.

成品用 WebP 编码（质量 86）。四宫格共享同样的光线和质感，画面在切换时无需再次下载。时间、地点和信号字样由网页排版。素材无法加载时，时间、地点、剧情和操作仍然可读。
