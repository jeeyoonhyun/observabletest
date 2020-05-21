// https://observablehq.com/@jeeyoonhyun/bar-chart-race-explained@3096
export default function define(runtime, observer) {
  const main = runtime.module();
  const fileAttachments = new Map([["finaldata@3.csv",new URL("./files/804384b5d371f8bfc171b76963295dd83750f0f4c66af00f1cb06772a652f5ad6024e46a1e0633c5c5714dff77c264ae0a63fa1b659c2f034c56896a3ace10c0",import.meta.url)]]);
  main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));
  main.variable(observer()).define(["md"], function(md){return(
md`# 연도별 건축물 미술작품 작가 통계`
)});
  main.variable(observer("title")).define("title", ["md"], function(md){return(
md`
1995년 시행된 ‘건축물미술작품제도’는 1만 제곱미터 이상의 건축물을 신축 및 증축할 경우 건축비용의 1퍼센트 이하를 미술작품 설치에 사용하도록 법으로 의무화 된 제도입니다. 작품 전시의 기회가 많지 않은 예술가와 대중들이 미술관에 가지 않고도 일상에서 작품을 접할 수 있도록 예술에 대한 흥미를 높이는 취지로 도입되었습니다.

그러나 취지와는 다르게 최근 4년 간 특정 작가 약 40%가 중복 수혜를 받는 등, 이른 바 ‘1%’ 법으로 불리며 소수 작가에 대한 특혜, 불법 계약, 작품의 부실함 등의 비리에 대한 의혹이 계속해서 제기되어 왔습니다.

문화체육관광부의 2018년 미술시장 실태조사에 따르면, 건축물 미술작품은 2017년 기준 전체 미술시장의 연간 총 거래금액 4942억원 중 879억원(17.8%)을 차지합니다.

이 그래프는 년도별로 특정 작가가 누적해서 총 몇 건의 건축물 미술작품을 제작했는지를 막대 그래프로 보여줍니다. 

출처
- 데이터: [공공미술포털](https://www.publicart.or.kr/statistics/genreStatistics.do?menuId=17)
- [이상헌 의원 “비리 의혹 ‘건축물미술작품제도’ 재정립해야”](http://www.seoulilbo.com/news/articleView.html?idxno=387574), 2019.09.30, 서울일보
- ['흉물'이 된 미술품, 묘책은 없을까](https://news.v.daum.net/v/20200104153409548) , 2020.01.04, 경향신문`
)});
  main.variable(observer("viewof replay")).define("viewof replay", ["html"], function(html){return(
html`<button>Replay`
)});
  main.variable(observer("replay")).define("replay", ["Generators", "viewof replay"], (G, _) => G.input(_));
  main.variable(observer("chart")).define("chart", ["replay","d3","width","height","bars","axis","labels","ticker","keyframes","duration","x","invalidation"], async function*(replay,d3,width,height,bars,axis,labels,ticker,keyframes,duration,x,invalidation)
{
  replay;

  const svg = d3.create("svg")
      .attr("viewBox", [0, 0, width, height]);

  const updateBars = bars(svg);
  const updateAxis = axis(svg);
  const updateLabels = labels(svg);
  const updateTicker = ticker(svg);

  yield svg.node();

  for (const keyframe of keyframes) {
    const transition = svg.transition()
        .duration(duration)
        .ease(d3.easeLinear);

    // Extract the top bar’s value.
    x.domain([0, keyframe[1][0].value]);

    updateAxis(keyframe, transition);
    updateBars(keyframe, transition);
    updateLabels(keyframe, transition);
    updateTicker(keyframe, transition);

    invalidation.then(() => svg.interrupt());
    await transition.end();
  }
}
);
  main.variable(observer("data")).define("data", ["d3","FileAttachment"], async function(d3,FileAttachment){return(
d3.csvParse(await FileAttachment("finaldata@3.csv").text(), d3.autoType)
)});
  main.variable(observer("duration")).define("duration", function(){return(
100
)});
  main.variable(observer()).define(["data"], function(data){return(
data
)});
  main.variable(observer()).define(["d3","data"], function(d3,data){return(
d3.group(data, d => d.name)
)});
  main.variable(observer()).define(["data"], function(data){return(
data.filter(d => d.name === "Heineken")
)});
  main.variable(observer("n")).define("n", function(){return(
12
)});
  main.variable(observer("names")).define("names", ["data"], function(data){return(
new Set(data.map(d => d.name))
)});
  main.variable(observer("datevalues")).define("datevalues", ["d3","data"], function(d3,data){return(
Array.from(d3.rollup(data, ([d]) => d.value, d => +d.date, d => d.name))
  .map(([date, data]) => [new Date(date), data])
  .sort(([a], [b]) => d3.ascending(a, b))
)});
  main.variable(observer("rank")).define("rank", ["names","d3","n"], function(names,d3,n){return(
function rank(value) {
  const data = Array.from(names, name => ({name, value: value(name)}));
  data.sort((a, b) => d3.descending(a.value, b.value));
  for (let i = 0; i < data.length; ++i) data[i].rank = Math.min(n, i);
  return data;
}
)});
  main.variable(observer()).define(["rank","datevalues"], function(rank,datevalues){return(
rank(name => datevalues[0][1].get(name))
)});
  main.variable(observer("k")).define("k", function(){return(
10
)});
  main.variable(observer("keyframes")).define("keyframes", ["d3","datevalues","k","rank"], function(d3,datevalues,k,rank)
{
  const keyframes = [];
  let ka, a, kb, b;
  for ([[ka, a], [kb, b]] of d3.pairs(datevalues)) {
    for (let i = 0; i < k; ++i) {
      const t = i / k;
      keyframes.push([
        new Date(ka * (1 - t) + kb * t),
        rank(name => (a.get(name) || 0) * (1 - t) + (b.get(name) || 0) * t)
      ]);
    }
  }
  keyframes.push([new Date(kb), rank(name => b.get(name) || 0)]);
  return keyframes;
}
);
  main.variable(observer("nameframes")).define("nameframes", ["d3","keyframes"], function(d3,keyframes){return(
d3.groups(keyframes.flatMap(([, data]) => data), d => d.name)
)});
  main.variable(observer("prev")).define("prev", ["nameframes","d3"], function(nameframes,d3){return(
new Map(nameframes.flatMap(([, data]) => d3.pairs(data, (a, b) => [b, a])))
)});
  main.variable(observer("next")).define("next", ["nameframes","d3"], function(nameframes,d3){return(
new Map(nameframes.flatMap(([, data]) => d3.pairs(data)))
)});
  main.variable(observer("bars")).define("bars", ["n","color","y","x","prev","next"], function(n,color,y,x,prev,next){return(
function bars(svg) {
  let bar = svg.append("g")
      .attr("fill-opacity", 0.6)
    .selectAll("rect");

  return ([date, data], transition) => bar = bar
    .data(data.slice(0, n), d => d.name)
    .join(
      enter => enter.append("rect")
        .attr("fill", color)
        .attr("height", y.bandwidth())
        .attr("x", x(0))
        .attr("y", d => y((prev.get(d) || d).rank))
        .attr("width", d => x((prev.get(d) || d).value) - x(0)),
      update => update,
      exit => exit.transition(transition).remove()
        .attr("y", d => y((next.get(d) || d).rank))
        .attr("width", d => x((next.get(d) || d).value) - x(0))
    )
    .call(bar => bar.transition(transition)
      .attr("y", d => y(d.rank))
      .attr("width", d => x(d.value) - x(0)));
}
)});
  main.variable(observer("labels")).define("labels", ["n","x","prev","y","next","textTween"], function(n,x,prev,y,next,textTween){return(
function labels(svg) {
  let label = svg.append("g")
      .style("font", "bold 12px var(--sans-serif)")
      .style("font-variant-numeric", "tabular-nums")
      .attr("text-anchor", "end")
    .selectAll("text");

  return ([date, data], transition) => label = label
    .data(data.slice(0, n), d => d.name)
    .join(
      enter => enter.append("text")
        .attr("transform", d => `translate(${x((prev.get(d) || d).value)},${y((prev.get(d) || d).rank)})`)
        .attr("y", y.bandwidth() / 2)
        .attr("x", -6)
        .attr("dy", "-0.25em")
        .text(d => d.name)
        .call(text => text.append("tspan")
          .attr("fill-opacity", 0.7)
          .attr("font-weight", "normal")
          .attr("x", -6)
          .attr("dy", "1.15em")),
      update => update,
      exit => exit.transition(transition).remove()
        .attr("transform", d => `translate(${x((next.get(d) || d).value)},${y((next.get(d) || d).rank)})`)
        .call(g => g.select("tspan").tween("text", d => textTween(d.value, (next.get(d) || d).value)))
    )
    .call(bar => bar.transition(transition)
      .attr("transform", d => `translate(${x(d.value)},${y(d.rank)})`)
      .call(g => g.select("tspan").tween("text", d => textTween((prev.get(d) || d).value, d.value))))
}
)});
  main.variable(observer("textTween")).define("textTween", ["d3","formatNumber"], function(d3,formatNumber){return(
function textTween(a, b) {
  const i = d3.interpolateNumber(a, b);
  return function(t) {
    this.textContent = formatNumber(i(t));
  };
}
)});
  main.variable(observer("formatNumber")).define("formatNumber", ["d3"], function(d3){return(
d3.format(",d")
)});
  main.variable(observer("axis")).define("axis", ["margin","d3","x","width","barSize","n","y"], function(margin,d3,x,width,barSize,n,y){return(
function axis(svg) {
  const g = svg.append("g")
      .attr("transform", `translate(0,${margin.top})`);

  const axis = d3.axisTop(x)
      .ticks(width / 160)
      .tickSizeOuter(0)
      .tickSizeInner(-barSize * (n + y.padding()));

  return (_, transition) => {
    g.transition(transition).call(axis);
    g.select(".tick:first-of-type text").remove();
    g.selectAll(".tick:not(:first-of-type) line").attr("stroke", "white");
    g.select(".domain").remove();
  };
}
)});
  main.variable(observer("ticker")).define("ticker", ["barSize","width","margin","n","formatDate","keyframes"], function(barSize,width,margin,n,formatDate,keyframes){return(
function ticker(svg) {
  const now = svg.append("text")
      .style("font", `bold ${barSize}px var(--sans-serif)`)
      .style("font-variant-numeric", "tabular-nums")
      .attr("text-anchor", "end")
      .attr("x", width - 6)
      .attr("y", margin.top + barSize * (n - 0.45))
      .attr("dy", "0.32em")
      .text(formatDate(keyframes[0][0]));

  return ([date], transition) => {
    transition.end().then(() => now.text(formatDate(date)));
  };
}
)});
  main.variable(observer("formatDate")).define("formatDate", ["d3"], function(d3){return(
d3.utcFormat("%Y")
)});
  main.variable(observer("color")).define("color", ["d3","data"], function(d3,data)
{
  const scale = d3.scaleOrdinal(d3.schemeTableau10);
  if (data.some(d => d.category !== undefined)) {
    const categoryByName = new Map(data.map(d => [d.name, d.category]))
    scale.domain(Array.from(categoryByName.values()));
    return d => scale(categoryByName.get(d.name));
  }
  return d => scale(d.name);
}
);
  main.variable(observer("x")).define("x", ["d3","margin","width"], function(d3,margin,width){return(
d3.scaleLinear([0, 1], [margin.left, width - margin.right])
)});
  main.variable(observer("y")).define("y", ["d3","n","margin","barSize"], function(d3,n,margin,barSize){return(
d3.scaleBand()
    .domain(d3.range(n + 1))
    .rangeRound([margin.top, margin.top + barSize * (n + 1 + 0.1)])
    .padding(0.1)
)});
  main.variable(observer("height")).define("height", ["margin","barSize","n"], function(margin,barSize,n){return(
margin.top + barSize * n + margin.bottom
)});
  main.variable(observer("barSize")).define("barSize", function(){return(
48
)});
  main.variable(observer("margin")).define("margin", function(){return(
{top: 16, right: 6, bottom: 6, left: 0}
)});
  main.variable(observer("d3")).define("d3", ["require"], function(require){return(
require("d3@5", "d3-array@2")
)});
  return main;
}
