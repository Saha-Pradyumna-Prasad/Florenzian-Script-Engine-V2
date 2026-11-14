#ifndef FLORENZIAN_H
#define FLORENZIAN_H

// 25 Modular C Functions (Italian + English mapping)
double addizione(double a, double b);                    // 1. Add/Sum
double sottrazione(double a, double b);                  // 2. Subtract
double moltiplicazione(double a, double b);              // 3. Multiply
double divisione(double a, double b);                    // 4. Divide
double modulo(double a, double b);                       // 5. Modulus
double esponenziazione(double a, double b);              // 6. Exponentiation
double media(double a, double b);                        // 7. Average
double massimo(double a, double b);                      // 8. Maximum
double minimo(double a, double b);                       // 9. Minimum
double percentuale(double a, double b);                  // 10. Percentage
double ipotenusa(double a, double b);                    // 11. Hypotenuse
double logaritmo(double a, double b);                    // 12. Logarithm
double valore_assoluto(double a, double b);              // 13. Absolute
int mcd(int a, int b);                                   // 14. GCD
int mcm(int a, int b);                                   // 15. LCM
int and_bit(int a, int b);                               // 16. Bitwise AND
int or_bit(int a, int b);                                // 17. Bitwise OR
int xor_bit(int a, int b);                               // 18. Bitwise XOR
int shift_left(int a, int b);                            // 19. Shift Left
int shift_right(int a, int b);                           // 20. Shift Right
double area_rettangolo(double a, double b);              // 21. Rectangle Area
double area_triangolo(double a, double b);               // 22. Triangle Area
double interesse_semplice(double p, double r, double t); // 23. Simple Interest
double distanza(double a, double b);                     // 24. Distance
int uguaglianza(double a, double b);                     // 25. Equality

// ---- NEW (26-35) ----
double radice(double a);                                 // 26. Square Root
double fattoriale(double a);                             // 27. Factorial
double fibonacci(double a);                              // 28. Fibonacci
int primo(int n);                                        // 29. Prime check
double area_cerchio(double r);                           // 30. Circle Area
double interesse_composto(double p, double r, double t); // 31. Compound Interest
double permutazioni(double n, double r);                 // 32. Permutations nPr
double combinazioni(double n, double r);                 // 33. Combinations nCr
double celsius_fahrenheit(double c);                     // 34. Celsius -> Fahrenheit
double gradi_radianti(double d);                         // 35. Degrees -> Radians

// ---- Engine API (used by WebAssembly build and CLI) ----
double fl_call(int id, double a, double b, double c); // NAN = invalid input
const char *fl_run(const char *src);                  // run a Florenzian program, returns result or "Error: ..."
const char *fl_lex(const char *src);                  // token list "NUM:2|OP:+|ID:pi"

#endif