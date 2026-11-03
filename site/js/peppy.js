/* Peppy, drawn in code so colours and accessories can change. Returns one standalone SVG string. */
let peppyN=0;
function drawPeppy(o={}){
const O='#141009',C=o.skin||'#6f9f58',D=o.shade||'#4f7d3f',LIP=o.lip||'#b86a42',LD=o.lipD||'#8c4b2b',HAIR=o.hair||LIP,HD=o.hairD||LD,H='#3a2a1c',top=o.top||'',under=o.under||'';
let n=(peppyN+=1000);

const blob=(p,c,d,w=5,dx=-12,dy=-15)=>{const id=++n;return `<defs><clipPath id="k${id}"><path d="${p}"/></clipPath></defs><path d="${p}" fill="${d}"/><g clip-path="url(#k${id})"><path d="${p}" fill="${c}" transform="translate(${dx} ${dy})"/></g><path d="${p}" fill="none" stroke="${O}" stroke-width="${w}" stroke-linejoin="round"/>`};
const gloss=(d,w=15,o=.6)=>`<path d="${d}" stroke="#fff" stroke-width="${w}" stroke-linecap="round" fill="none" opacity="${o}"/>`;
const leg=(p,c,d,hx,hy)=>blob(p,c,d)+`<path d="M${hx-60} ${hy+4}C${hx-30} ${hy+18} ${hx+36} ${hy+18} ${hx+66} ${hy+4}C${hx+76} ${hy+34} ${hx+80} ${hy+56} ${hx+74} ${hy+66}C${hx+30} ${hy+80} ${hx-26} ${hy+80} ${hx-70} ${hy+66}C${hx-76} ${hy+56} ${hx-70} ${hy+34} ${hx-60} ${hy+4}Z" fill="${H}" stroke="${O}" stroke-width="5" stroke-linejoin="round"/><path d="M${hx-52} ${hy+24}C${hx-20} ${hy+36} ${hx+26} ${hy+36} ${hx+58} ${hy+24}" stroke="#6b4e35" stroke-width="6" fill="none" stroke-linecap="round"/>`;
const FARH='M300 610C250 700 262 760 240 810C226 850 240 910 234 970L346 970C346 900 356 850 372 810C396 740 426 690 440 620Z';
const FARF='M620 620C618 700 630 770 614 830C606 870 622 920 614 976L726 976C728 910 732 870 744 830C762 760 762 690 756 620Z';
const NEARH='M150 540C100 650 126 740 104 806C92 850 116 914 106 982L222 982C226 910 240 860 256 816C282 740 330 700 360 620Z';
const NEARF='M720 640C700 710 742 776 724 836C714 876 734 926 724 988L842 988C846 920 852 876 864 836C884 766 866 700 830 640Z';
const BODY='M790 400C690 386 590 426 500 438C420 452 340 452 270 416C190 384 96 440 84 540C74 626 124 690 206 704C320 722 500 716 620 716C730 716 846 706 900 620C944 548 900 420 790 400Z';
const out=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="-60 -90 1340 1350" role="img" aria-label="Peppy">${under}
<ellipse cx="500" cy="1222" rx="490" ry="18" fill="${O}" opacity=".13"/>
<g transform="translate(20 170)">
<g class="p-tail">${blob('M140 440C60 440 6 510 12 600C16 680 -10 770 16 850C30 900 64 950 110 960C96 920 100 880 112 850C120 900 150 930 190 930C156 880 156 800 176 720C192 650 200 560 220 490Z',HAIR,HD)}
${gloss('M62 520C48 600 44 700 58 810',11,.4)}<path d="M116 560C102 650 96 740 106 830M150 560C136 650 130 730 134 800" fill="none" stroke="${HD}" stroke-width="6" stroke-linecap="round"/></g>
${leg(FARH,D,D,290,960)}${leg(FARF,D,D,670,966)}
${leg(NEARH,C,D,164,972)}${leg(NEARF,C,D,783,978)}
</g>
<path d="M732 326C724 356 706 372 672 384C632 394 590 410 568 452C548 490 544 530 552 566C556 600 540 640 526 676C512 704 508 736 524 752C534 768 552 764 558 750C570 768 594 762 598 744C614 748 630 728 622 708C628 694 626 672 618 660C636 622 652 590 650 560C650 530 676 506 698 462C698 500 700 540 703 572C706 640 724 740 730 790L914 790C920 740 938 640 941 572C944 540 946 500 946 462C968 506 994 530 994 560C992 590 1008 622 1026 660C1018 672 1016 694 1022 708C1014 728 1030 748 1046 744C1050 762 1074 768 1086 750C1092 764 1110 768 1120 752C1136 736 1132 704 1118 676C1104 640 1088 600 1092 566C1100 530 1096 490 1076 452C1054 410 1012 394 972 384C938 372 920 356 912 326Z" fill="none" stroke="${O}" stroke-width="11" stroke-linejoin="round"/>
<path d="${BODY}" transform="translate(20 170)" fill="none" stroke="${O}" stroke-width="11" stroke-linejoin="round"/>
<g transform="translate(20 170)">${blob(BODY,C,D,0)}<path d="M112 640C118 700 120 760 104 806C92 850 116 914 106 978L222 978C226 910 240 860 256 816C276 760 304 730 330 700L300 620Z" fill="${C}"/><path d="M724 696C730 760 738 790 724 836C714 876 734 926 724 984L842 984C846 920 852 876 864 836C880 780 874 720 858 668L820 620Z" fill="${C}"/><path d="M214 960C216 900 228 850 244 810C262 760 286 736 310 716" fill="none" stroke="${D}" stroke-width="13" stroke-linecap="round" opacity=".6"/><path d="M832 972C836 916 842 876 852 838C864 790 862 740 848 700" fill="none" stroke="${D}" stroke-width="13" stroke-linecap="round" opacity=".6"/><path d="M112 640C118 700 120 760 104 806C92 850 116 914 106 978" fill="none" stroke="${O}" stroke-width="5.5" stroke-linecap="round"/><path d="M222 978C226 910 240 860 256 816C276 760 304 730 330 700" fill="none" stroke="${O}" stroke-width="5.5" stroke-linecap="round"/><path d="M724 696C730 760 738 790 724 836C714 876 734 926 724 984" fill="none" stroke="${O}" stroke-width="5.5" stroke-linecap="round"/><path d="M842 984C846 920 852 876 864 836C880 780 874 720 858 668" fill="none" stroke="${O}" stroke-width="5.5" stroke-linecap="round"/></g>
<path d="M732 326C724 356 706 372 672 384C632 394 590 410 568 452C548 490 544 530 552 566C556 600 540 640 526 676C512 704 508 736 524 752C534 768 552 764 558 750C570 768 594 762 598 744C614 748 630 728 622 708C628 694 626 672 618 660C636 622 652 590 650 560C650 530 676 506 698 462C698 500 700 540 703 572C706 640 724 740 730 790L914 790C920 740 938 640 941 572C944 540 946 500 946 462C968 506 994 530 994 560C992 590 1008 622 1026 660C1018 672 1016 694 1022 708C1014 728 1030 748 1046 744C1050 762 1074 768 1086 750C1092 764 1110 768 1120 752C1136 736 1132 704 1118 676C1104 640 1088 600 1092 566C1100 530 1096 490 1076 452C1054 410 1012 394 972 384C938 372 920 356 912 326Z" fill="${C}"/>
<g transform="translate(20 170)">${gloss('M280 500C340 520 420 518 500 500',16)}<circle cx="150" cy="520" r="11" fill="#fff" opacity=".6"/></g>
<g transform="translate(20 170)" fill="none" stroke="${D}" stroke-width="7" stroke-linecap="round">
<path d="M196 560C176 620 196 670 250 690"/><path d="M330 640C350 668 380 684 410 690"/>
<path d="M640 650C670 690 720 700 760 696"/></g>
<g fill="none" stroke="${D}" stroke-width="6" stroke-linecap="round">
<path d="M150 1000C176 1012 206 1012 232 1000"/><path d="M770 1010C796 1022 836 1022 862 1010"/></g>
<path d="M722 348C770 392 860 392 900 352L908 368C860 412 768 412 712 372Z" fill="${D}" opacity=".75"/>
<path d="M704 408C764 436 880 436 940 404" fill="none" stroke="${D}" stroke-width="6" stroke-linecap="round"/>
<g fill="none" stroke="${D}" stroke-width="6" stroke-linecap="round"><path d="M566 566C582 576 602 576 620 566"/><path d="M1078 566C1062 576 1042 576 1024 566"/></g><!-- soft shade on the far side of each arm and the chest -->
<path d="M1040 452C1076 490 1098 530 1092 566C1088 600 1104 640 1114 668" fill="none" stroke="${D}" stroke-width="16" stroke-linecap="round" opacity=".75"/>
<path d="M628 470C600 500 596 530 604 566C608 600 590 640 578 668" fill="none" stroke="${D}" stroke-width="14" stroke-linecap="round" opacity=".6"/>
<path d="M946 484C946 540 944 600 936 650" fill="none" stroke="${D}" stroke-width="14" stroke-linecap="round" opacity=".55"/>
<g fill="none" stroke="${D}" stroke-width="7" stroke-linecap="round"><path d="M716 486C748 518 802 518 816 486"/><path d="M828 486C842 518 896 518 928 486"/><path d="M822 494L822 720"/><path d="M744 588C780 602 864 602 900 588"/><path d="M750 656C784 668 860 668 894 656"/></g>
${gloss('M584 462C566 492 562 526 570 560',10,.5)}
<path d="M616 672C638 664 656 672 658 688C660 704 640 712 624 706" fill="${C}" stroke="${O}" stroke-width="5" stroke-linejoin="round"/>
<path d="M1028 672C1006 664 988 672 986 688C984 704 1004 712 1020 706" fill="${C}" stroke="${O}" stroke-width="5" stroke-linejoin="round"/>
<!-- the near arm crosses the horse, so its edge stays drawn -->
<path d="M732 326C724 356 706 372 672 384C632 394 590 410 568 452C548 490 544 530 552 566C556 600 540 640 526 676C512 704 508 736 524 752C534 768 552 764 558 750C570 768 594 762 598 744C614 748 630 728 622 708C628 694 626 672 618 660C636 622 652 590 650 560C650 530 676 506 698 462C698 500 700 540 703 572" fill="none" stroke="${O}" stroke-width="5.5" stroke-linejoin="round" stroke-linecap="round"/>
<g class="p-head"><g transform="translate(590 84) scale(.36)">
<!-- head outline from the reference, closed above and below the crop -->
${blob('M150 60C230 -40 460 -70 700 -50C860 -66 1040 -40 1120 40C1190 90 1200 150 1188 180C1140 240 1080 280 1030 310C1090 350 1120 420 1116 470C1150 500 1150 530 1110 570C1090 620 1040 680 960 712C760 770 420 760 240 690C120 640 20 540 0 420C-20 330 -10 170 60 90C90 70 120 62 150 60Z',C,D,10,-14,-18)}
${gloss('M170 110C290 40 470 20 620 30',22,.5)}
<g fill="none" stroke="${O}" stroke-width="9" stroke-linecap="round">
<path d="M340 95C460 20 620 -6 770 30"/><path d="M305 135C440 50 610 30 775 65"/>
<path d="M785 75C880 -2 1050 0 1150 90"/><path d="M782 60C870 -24 1060 -26 1170 70"/></g>
<path d="M305 135C440 60 600 50 775 70C800 90 800 120 790 150C640 90 480 110 390 165C350 160 300 160 305 135Z" fill="${C}" stroke="${O}" stroke-width="9" stroke-linejoin="round"/>
<path d="M782 92C900 40 1060 40 1186 150C1120 110 950 100 800 170C790 140 780 120 782 92Z" fill="${C}" stroke="${O}" stroke-width="9" stroke-linejoin="round"/>
<path d="M390 165C470 100 620 70 720 92C770 104 796 130 800 150C780 210 680 236 560 238C490 240 430 210 390 165Z" fill="#fff" stroke="${O}" stroke-width="10" stroke-linejoin="round"/>
<path d="M800 150C850 94 960 74 1050 86C1120 96 1168 130 1186 170C1110 216 990 224 880 216C830 210 800 186 800 150Z" fill="#fff" stroke="${O}" stroke-width="10" stroke-linejoin="round"/>
<circle cx="578" cy="152" r="82" fill="#0a0806"/><circle cx="975" cy="150" r="80" fill="#0a0806"/>
<circle cx="551" cy="104" r="13" fill="#fff"/><circle cx="600" cy="128" r="16" fill="#fff"/><circle cx="553" cy="148" r="9" fill="#fff"/>
<circle cx="950" cy="100" r="12" fill="#fff"/><circle cx="998" cy="127" r="15" fill="#fff"/><circle cx="952" cy="146" r="8" fill="#fff"/>
<g class="p-blink" opacity="0"><ellipse cx="596" cy="158" rx="216" ry="94" fill="${C}"/><ellipse cx="992" cy="152" rx="198" ry="88" fill="${C}"/><path d="M386 170C520 216 680 216 800 158M806 158C900 204 1080 206 1186 166" fill="none" stroke="${O}" stroke-width="10" stroke-linecap="round"/></g><g fill="none" stroke="${O}" stroke-width="9" stroke-linecap="round">
<path d="M390 220C460 270 650 290 790 205"/><path d="M820 296C900 330 1080 320 1162 200"/>
<path d="M548 350C610 326 660 310 706 286"/><path d="M820 298C850 318 880 332 910 342"/></g>
${blob('M306 545C310 490 370 462 450 468C600 480 760 540 900 530C980 526 1050 500 1100 472C1130 464 1150 490 1136 516C1120 540 1090 552 1086 570C1094 610 1072 632 1040 642C900 672 640 640 480 612C390 600 300 600 306 545Z',LIP,LD,10,-8,-11)}
<path d="M385 530C470 526 600 546 720 562C840 578 960 590 1070 540" fill="none" stroke="${O}" stroke-width="9" stroke-linecap="round"/>
</g></g>${top}</svg>`;

return out;
}
