#include "florenzian.h"
#include <math.h>
#include <stdlib.h>

double addizione(double a, double b) { return a + b; }
double sottrazione(double a, double b) { return a - b; }
double moltiplicazione(double a, double b) { return a * b; }
double divisione(double a, double b) { return b != 0 ? a / b : 0; }
double modulo(double a, double b) { return b != 0 ? fmod(a, b) : 0; }
double esponenziazione(double a, double b) { return pow(a, b); }
double media(double a, double b) { return (a + b) / 2.0; }
double massimo(double a, double b) { return (a > b) ? a : b; }
double minimo(double a, double b) { return (a < b) ? a : b; }
double percentuale(double a, double b) { return (a / 100.0) * b; }
double ipotenusa(double a, double b) { return sqrt((a * a) + (b * b)); }
double logaritmo(double a, double b) { return (a > 0 && b > 0 && b != 1) ? log(a) / log(b) : 0; }
double valore_assoluto(double a, double b) { return fabs(a - b); }

int mcd(int a, int b) {
    while (b != 0) {
        int temp = b;
        b = a % b;
        a = temp;
    }
    return abs(a);
}

int mcm(int a, int b) {
    if (a == 0 || b == 0) return 0;
    return abs(a * b) / mcd(a, b);
}

int and_bit(int a, int b) { return a & b; }
int or_bit(int a, int b) { return a | b; }
int xor_bit(int a, int b) { return a ^ b; }
int shift_left(int a, int b) { return a << b; }
int shift_right(int a, int b) { return a >> b; }
double area_rettangolo(double a, double b) { return a * b; }
double area_triangolo(double a, double b) { return 0.5 * a * b; }
double interesse_semplice(double p, double r, double t) { return (p * r * t) / 100.0; }
double distanza(double a, double b) { return sqrt((a * a) + (b * b)); }
int uguaglianza(double a, double b) { return (a == b) ? 1 : 0; }
/* ===================== NEW FUNCTIONS (26-35) ===================== */
#include <ctype.h>
#include <stdio.h>
#include <string.h>
#ifndef M_PI
#define M_PI 3.14159265358979323846
#endif
#ifndef M_E
#define M_E 2.71828182845904523536
#endif

double radice(double a) { return a >= 0 ? sqrt(a) : NAN; }
double fattoriale(double a) {
    if (a < 0 || a > 170 || a != floor(a)) return NAN;
    double r = 1; for (int i = 2; i <= (int)a; i++) r *= i; return r;
}
double fibonacci(double a) {
    if (a < 0 || a > 1000 || a != floor(a)) return NAN;
    double x = 0, y = 1; for (int i = 0; i < (int)a; i++) { double t = x + y; x = y; y = t; } return x;
}
int primo(int n) { if (n < 2) return 0; for (long i = 2; i * i <= n; i++) if (n % i == 0) return 0; return 1; }
double area_cerchio(double r) { return r < 0 ? NAN : M_PI * r * r; }
double interesse_composto(double p, double r, double t) { return p * pow(1 + r / 100.0, t) - p; }
double permutazioni(double n, double r) {
    if (n < 0 || r < 0 || r > n || n != floor(n) || r != floor(r)) return NAN;
    double x = 1; for (int i = 0; i < (int)r; i++) x *= (n - i); return x;
}
double combinazioni(double n, double r) {
    if (n < 0 || r < 0 || r > n || n != floor(n) || r != floor(r)) return NAN;
    double x = 1; for (int i = 1; i <= (int)r; i++) x = x * (n - r + i) / i; return x;
}
double celsius_fahrenheit(double c) { return c * 9.0 / 5.0 + 32.0; }
double gradi_radianti(double d) { return d * M_PI / 180.0; }

/* ===================== ENGINE: dispatcher + mini compiler ===================== */
typedef struct { const char *name; int id; int argc; } Fn;
static const Fn FN[] = {
 {"addizione",1,2},{"sottrazione",2,2},{"moltiplicazione",3,2},{"divisione",4,2},{"modulo",5,2},
 {"esponenziazione",6,2},{"media",7,2},{"massimo",8,2},{"minimo",9,2},{"percentuale",10,2},
 {"ipotenusa",11,2},{"logaritmo",12,2},{"valore_assoluto",13,2},{"mcd",14,2},{"mcm",15,2},
 {"and_bit",16,2},{"or_bit",17,2},{"xor_bit",18,2},{"shift_left",19,2},{"shift_right",20,2},
 {"area_rettangolo",21,2},{"area_triangolo",22,2},{"interesse_semplice",23,3},{"distanza",24,2},
 {"uguaglianza",25,2},{"radice",26,1},{"fattoriale",27,1},{"fibonacci",28,1},{"primo",29,1},
 {"area_cerchio",30,1},{"interesse_composto",31,3},{"permutazioni",32,2},{"combinazioni",33,2},
 {"celsius_fahrenheit",34,1},{"gradi_radianti",35,1}
};

double fl_call(int id, double a, double b, double c) {
    switch (id) {
    case 1: return addizione(a,b);   case 2: return sottrazione(a,b);
    case 3: return moltiplicazione(a,b);
    case 4: return b != 0 ? divisione(a,b) : NAN;
    case 5: return b != 0 ? modulo(a,b) : NAN;
    case 6: return esponenziazione(a,b); case 7: return media(a,b);
    case 8: return massimo(a,b);     case 9: return minimo(a,b);
    case 10: return percentuale(a,b); case 11: return ipotenusa(a,b);
    case 12: return (a > 0 && b > 0 && b != 1) ? logaritmo(a,b) : NAN;
    case 13: return valore_assoluto(a,b);
    case 14: return mcd((int)a,(int)b);  case 15: return mcm((int)a,(int)b);
    case 16: return and_bit((int)a,(int)b); case 17: return or_bit((int)a,(int)b);
    case 18: return xor_bit((int)a,(int)b); case 19: return shift_left((int)a,(int)b);
    case 20: return shift_right((int)a,(int)b);
    case 21: return area_rettangolo(a,b); case 22: return area_triangolo(a,b);
    case 23: return interesse_semplice(a,b,c); case 24: return distanza(a,b);
    case 25: return uguaglianza(a,b);
    case 26: return radice(a);  case 27: return fattoriale(a); case 28: return fibonacci(a);
    case 29: return primo((int)a); case 30: return area_cerchio(a);
    case 31: return interesse_composto(a,b,c); case 32: return permutazioni(a,b);
    case 33: return combinazioni(a,b); case 34: return celsius_fahrenheit(a);
    case 35: return gradi_radianti(a);
    }
    return NAN;
}

/* ---- lexer ---- */
typedef struct { char k; double v; char s[32]; } Tok;   /* k: n=number i=identifier o=operator e=end */
static Tok T[256]; static int nt, ip; static char ERR[128]; static double LAST;
static char VN[16][32]; static double VV[16]; static int nv;

static int lex(const char *s) {
    nt = 0; ERR[0] = 0;
    while (*s) {
        if (*s == ' ' || *s == '\t' || *s == '\r') { s++; continue; }
        if (nt >= 250) { snprintf(ERR, sizeof ERR, "Error: program too long"); return 0; }
        Tok *t = &T[nt];
        if (isdigit((unsigned char)*s) || (*s == '.' && isdigit((unsigned char)s[1]))) {
            char *e; t->k = 'n'; t->v = strtod(s, &e); s = e;
        } else if (isalpha((unsigned char)*s) || *s == '_') {
            int i = 0; t->k = 'i';
            while ((isalnum((unsigned char)*s) || *s == '_') && i < 31) t->s[i++] = *s++;
            t->s[i] = 0;
        } else if (strchr("+-*/%^(),=;\n", *s)) {
            t->k = 'o'; t->s[0] = (*s == '\n') ? ';' : *s; t->s[1] = 0; s++;
        } else { snprintf(ERR, sizeof ERR, "Error: unexpected character '%c'", *s); return 0; }
        nt++;
    }
    T[nt].k = 'e'; return 1;
}

/* ---- recursive-descent parser + evaluator ---- */
static double expr(void);
static int accept(char c) { if (T[ip].k == 'o' && T[ip].s[0] == c) { ip++; return 1; } return 0; }
static double fail(const char *m) { if (!ERR[0]) snprintf(ERR, sizeof ERR, "Error: %s", m); return NAN; }

static double primary(void) {
    Tok *t = &T[ip];
    if (t->k == 'n') { ip++; return t->v; }
    if (t->k == 'i') {
        ip++;
        if (accept('(')) {
            const Fn *f = NULL; double a[3] = {0,0,0}; int n = 0;
            for (unsigned i = 0; i < sizeof FN / sizeof *FN; i++) if (!strcmp(FN[i].name, t->s)) f = &FN[i];
            if (!f) { char m[64]; snprintf(m, sizeof m, "unknown function '%s'", t->s); return fail(m); }
            if (!accept(')')) {
                do { double v = expr(); if (n < 3) a[n] = v; n++; } while (accept(','));
                if (!accept(')')) return fail("expected ')'");
            }
            if (n != f->argc) return fail("wrong number of arguments");
            double r = fl_call(f->id, a[0], a[1], a[2]);
            if (isnan(r)) return fail("invalid input for function");
            return r;
        }
        if (!strcmp(t->s, "pi")) return M_PI;
        if (!strcmp(t->s, "e"))  return M_E;
        for (int i = 0; i < nv; i++) if (!strcmp(VN[i], t->s)) return VV[i];
        return fail("undefined variable");
    }
    if (accept('(')) { double v = expr(); if (!accept(')')) return fail("expected ')'"); return v; }
    return fail("unexpected token");
}
static double unary(void);
static double power(void) { double b = primary(); if (accept('^')) return pow(b, unary()); return b; }
static double unary(void) { if (accept('-')) return -unary(); if (accept('+')) return unary(); return power(); }
static double term(void) {
    double v = unary();
    for (;;) {
        if (accept('*')) v *= unary();
        else if (accept('/')) { double d = unary(); if (d == 0) return fail("division by zero"); v /= d; }
        else if (accept('%')) { double d = unary(); if (d == 0) return fail("division by zero"); v = fmod(v, d); }
        else return v;
    }
}
static double expr(void) {
    double v = term();
    for (;;) { if (accept('+')) v += term(); else if (accept('-')) v -= term(); else return v; }
}
static int at_sep(void) { return T[ip].k == 'o' && T[ip].s[0] == ';'; }

const char *fl_run(const char *src) {
    static char out[64];
    nv = 0; ip = 0; LAST = 0;
    if (!lex(src)) return ERR;
    if (nt == 0) return "Error: empty program";
    while (T[ip].k != 'e' && !ERR[0]) {
        if (at_sep()) { ip++; continue; }
        if (T[ip].k == 'i' && T[ip+1].k == 'o' && T[ip+1].s[0] == '=') {
            char name[32]; strcpy(name, T[ip].s); ip += 2;
            double v = expr(); LAST = v;
            int i; for (i = 0; i < nv; i++) if (!strcmp(VN[i], name)) break;
            if (i == nv && nv < 16) { strcpy(VN[nv], name); nv++; }
            if (i < 16) VV[i] = v;
        } else LAST = expr();
        if (!ERR[0] && T[ip].k != 'e' && !at_sep()) fail("unexpected token");
    }
    if (ERR[0]) return ERR;
    snprintf(out, sizeof out, "%.10g", LAST);
    return out;
}

const char *fl_lex(const char *src) {
    static char out[4096]; int n = 0; out[0] = 0;
    if (!lex(src)) return ERR;
    for (int i = 0; i < nt && n < 4000; i++) {
        if (T[i].k == 'n') n += snprintf(out + n, sizeof out - n, "%sNUM:%.10g", i ? "|" : "", T[i].v);
        else n += snprintf(out + n, sizeof out - n, "%s%s:%s", i ? "|" : "", T[i].k == 'i' ? "ID" : "OP", T[i].s);
    }
    return out;
}