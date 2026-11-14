/* Native CLI:  gcc florenzian.c main.c -lm -o flz && ./flz "mcd(84,36)+fibonacci(10)" */
#include <stdio.h>
#include "florenzian.h"
int main(int argc, char **argv)
{
    if (argc < 2)
    {
        puts("usage: flz \"expression\"");
        return 1;
    }
    printf("tokens: %s\n", fl_lex(argv[1]));
    printf("result: %s\n", fl_run(argv[1]));
    return 0;
}