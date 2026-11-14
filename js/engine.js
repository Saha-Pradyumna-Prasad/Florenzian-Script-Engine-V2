/* Florenzian engine: tries the C/WebAssembly build (engine/engine.js), falls back to a JS mirror. */
(function () {
  const N = NaN;
  const F = [
    [1,"addizione","Add/Sum","Addizione","Addition of two numbers",2,(a,b)=>a+b],
    [2,"sottrazione","Subtract","Sottrazione","Subtraction of two numbers",2,(a,b)=>a-b],
    [3,"moltiplicazione","Multiply","Moltiplicazione","Multiplication of two numbers",2,(a,b)=>a*b],
    [4,"divisione","Divide","Divisione","Division of two numbers",2,(a,b)=>b!==0?a/b:N,"Error: Division by zero"],
    [5,"modulo","Modulus","Modulo","Remainder of division (A % B)",2,(a,b)=>b!==0?a%b:N,"Error: Division by zero"],
    [6,"esponenziazione","Exponentiation","Esponenziazione","Power calculation (A^B)",2,Math.pow],
    [7,"media","Average","Media","Average of two numbers",2,(a,b)=>(a+b)/2],
    [8,"massimo","Maximum","Massimo","Maximum value",2,Math.max],
    [9,"minimo","Minimum","Minimo","Minimum value",2,Math.min],
    [10,"percentuale","Percentage","Percentuale","Percentage calculation (A% of B)",2,(a,b)=>a/100*b],
    [11,"ipotenusa","Hypotenuse","Ipotenusa","Hypotenuse (Pythagoras)",2,Math.hypot],
    [12,"logaritmo","Logarithm","Logaritmo","Logarithm Base B of A",2,(a,b)=>(a>0&&b>0&&b!==1)?Math.log(a)/Math.log(b):N,"Error: Invalid Log Input"],
    [13,"valore_assoluto","Absolute","Valore Assoluto","Absolute difference |A - B|",2,(a,b)=>Math.abs(a-b)],
    [14,"mcd","GCD","MCD","Greatest Common Divisor",2,(a,b)=>{let x=Math.abs(Math.trunc(a)),y=Math.abs(Math.trunc(b));while(y){[x,y]=[y,x%y]}return x}],
    [15,"mcm","LCM","mcm","Least Common Multiple",2,(a,b)=>{let x=Math.abs(Math.trunc(a)),y=Math.abs(Math.trunc(b));if(!x||!y)return 0;let g=(m,n)=>n?g(n,m%n):m;return x*y/g(x,y)}],
    [16,"and_bit","Bitwise AND","AND bit a bit","Bitwise AND operation",2,(a,b)=>a&b],
    [17,"or_bit","Bitwise OR","OR bit a bit","Bitwise OR operation",2,(a,b)=>a|b],
    [18,"xor_bit","Bitwise XOR","XOR bit a bit","Bitwise XOR operation",2,(a,b)=>a^b],
    [19,"shift_left","Shift Left","Scorrimento a Sinistra","Shift left (A << B)",2,(a,b)=>a<<b],
    [20,"shift_right","Shift Right","Scorrimento a Destra","Shift right (A >> B)",2,(a,b)=>a>>b],
    [21,"area_rettangolo","Rectangle Area","Area Rettangolo","Rectangle area calculation",2,(a,b)=>a*b],
    [22,"area_triangolo","Triangle Area","Area Triangolo","Triangle area calculation",2,(a,b)=>.5*a*b],
    [23,"interesse_semplice","Simple Interest","Interesse Semplice","Simple interest rate calculation",3,(a,b,c)=>a*b*c/100,"",["Principal (P)","Rate % (R)","Time (T)"]],
    [24,"distanza","Distance","Distanza","2D distance formula",2,Math.hypot],
    [25,"uguaglianza","Equality","Uguaglianza","Equality validation (A == B)",2,(a,b)=>a===b?1:0],
    [26,"radice","Square Root","Radice","Square root of a number",1,a=>a>=0?Math.sqrt(a):N,"Error: Negative input"],
    [27,"fattoriale","Factorial","Fattoriale","Factorial n! (0 to 170)",1,a=>{if(a<0||a>170||a!==Math.floor(a))return N;let r=1;for(let i=2;i<=a;i++)r*=i;return r},"Error: Use a whole number 0-170"],
    [28,"fibonacci","Fibonacci","Fibonacci","n-th Fibonacci number (0 to 1000)",1,a=>{if(a<0||a>1000||a!==Math.floor(a))return N;let x=0,y=1;for(let i=0;i<a;i++)[x,y]=[y,x+y];return x},"Error: Use a whole number 0-1000"],
    [29,"primo","Prime Check","Primo","Prime number test (1 = prime)",1,a=>{a=Math.trunc(a);if(a<2)return 0;for(let i=2;i*i<=a;i++)if(a%i===0)return 0;return 1}],
    [30,"area_cerchio","Circle Area","Area Cerchio","Circle area from radius",1,a=>a<0?N:Math.PI*a*a,"Error: Negative radius"],
    [31,"interesse_composto","Compound Interest","Interesse Composto","Compound interest earned",3,(p,r,t)=>p*Math.pow(1+r/100,t)-p,"",["Principal (P)","Rate % (R)","Years (T)"]],
    [32,"permutazioni","Permutations","Permutazioni","Permutations nPr",2,(n,r)=>{if(n<0||r<0||r>n||n%1||r%1)return N;let x=1;for(let i=0;i<r;i++)x*=n-i;return x},"Error: Need whole numbers, 0 <= r <= n"],
    [33,"combinazioni","Combinations","Combinazioni","Combinations nCr",2,(n,r)=>{if(n<0||r<0||r>n||n%1||r%1)return N;let x=1;for(let i=1;i<=r;i++)x=x*(n-r+i)/i;return x},"Error: Need whole numbers, 0 <= r <= n"],
    [34,"celsius_fahrenheit","Celsius to Fahrenheit","Celsius in Fahrenheit","Temperature conversion",1,a=>a*9/5+32],
    [35,"gradi_radianti","Degrees to Radians","Gradi in Radianti","Angle conversion",1,a=>a*Math.PI/180]
  ].map(([id,fn,eng,ita,desc,count,calc,err,labels])=>({id,fn,eng,ita,desc,count,calc,err:err||"Error: Invalid input",labels}));
  const BY = Object.fromEntries(F.map(f=>[f.fn,f]));
  const fmt = n => String(+n.toPrecision(10));

  /* --- JS mirror of the C lexer/parser (used only when the WASM build is missing) --- */
  function lexJS(s){
    const re=/[ \t\r]*(?:(\d*\.?\d+(?:[eE][+-]?\d+)?)|([A-Za-z_]\w*)|([-+*\/%^(),=;\n]))/y,t=[];s=s.trimEnd();
    while(re.lastIndex<s.length){const i=re.lastIndex,m=re.exec(s);
      if(!m)throw "Error: unexpected character '"+s.slice(i).trim()[0]+"'";
      t.push(m[1]?["NUM",+m[1]]:m[2]?["ID",m[2]]:["OP",m[3]==="\n"?";":m[3]]);}
    return t;}
  function runJS(src){
    const t=lexJS(src);if(!t.length)throw "Error: empty program";
    let p=0,last=0;const vars={},E=m=>{throw "Error: "+m},
      is=c=>t[p]&&t[p][0]==="OP"&&t[p][1]===c,eat=c=>is(c)&&++p;
    const prim=()=>{const k=t[p++];if(!k)E("unexpected token");
      if(k[0]==="NUM")return k[1];
      if(k[0]==="ID"){
        if(eat("(")){const f=BY[k[1]];if(!f)E("unknown function '"+k[1]+"'");const a=[];
          if(!eat(")")){do a.push(expr());while(eat(","));if(!eat(")"))E("expected ')'");}
          if(a.length!==f.count)E("wrong number of arguments");
          const r=f.calc(...a);if(Number.isNaN(r))E("invalid input for function");return r;}
        if(k[1]==="pi")return Math.PI;if(k[1]==="e")return Math.E;
        if(!(k[1] in vars))E("undefined variable");return vars[k[1]];}
      if(k[1]==="("){const v=expr();if(!eat(")"))E("expected ')'");return v;}
      E("unexpected token");};
    const unary=()=>eat("-")?-unary():eat("+")?unary():power(),
      power=()=>{const b=prim();return eat("^")?Math.pow(b,unary()):b},
      term=()=>{let v=unary();for(;;){if(eat("*"))v*=unary();else if(eat("/")){const d=unary();if(!d)E("division by zero");v/=d}
        else if(eat("%")){const d=unary();if(!d)E("division by zero");v%=d}else return v}},
      expr=()=>{let v=term();for(;;){if(eat("+"))v+=term();else if(eat("-"))v-=term();else return v}};
    while(p<t.length){
      if(is(";")){p++;continue}
      if(t[p][0]==="ID"&&t[p+1]&&t[p+1][0]==="OP"&&t[p+1][1]==="="){const n=t[p][1];p+=2;vars[n]=last=expr();}
      else last=expr();
      if(p<t.length&&!is(";"))E("unexpected token");}
    return fmt(last);}

  const FL = { functions:F, mode:"js", wasm:null, ready:null };
  FL.fmt = (f,r)=>f.id===25?(r?"TRUE (1)":"FALSE (0)"):f.id===29?(r?"PRIME (1)":"NOT PRIME (0)"):fmt(r);
  FL.call = (f,args)=>{
    const [a,b,c]=[args[0]||0,args[1]||0,args[2]||0];
    const r = FL.wasm ? FL.wasm.ccall("fl_call","number",["number","number","number","number"],[f.id,a,b,c]) : f.calc(a,b,c);
    return Number.isNaN(r) ? f.err : FL.fmt(f,r);};
  FL.run = src=>{try{return FL.wasm?FL.wasm.ccall("fl_run","string",["string"],[src]):runJS(src)}catch(e){return typeof e==="string"?e:"Error: "+e.message}};
  FL.lex = src=>{try{
    const raw=FL.wasm?FL.wasm.ccall("fl_lex","string",["string"],[src]):lexJS(src).map(([k,v])=>k+":"+v).join("|");
    return raw.startsWith("Error")?{error:raw}:{tokens:raw.split("|").filter(Boolean).map(x=>{const i=x.indexOf(":");return[x.slice(0,i),x.slice(i+1)]})}
  }catch(e){return{error:String(e)}}};

  /* Load WASM build if the file exists; silently keep JS fallback otherwise */
  FL.ready = new Promise(res=>{
    if(typeof document==="undefined")return res(FL);
    const s=document.createElement("script");s.src="engine/engine.js";
    s.onload=()=>{try{window.FlorenzianModule().then(m=>{FL.wasm=m;FL.mode="wasm";res(FL)})}catch(e){res(FL)}};
    s.onerror=()=>res(FL);document.head.appendChild(s);});
  (typeof window!=="undefined"?window:globalThis).FL=FL;
})();