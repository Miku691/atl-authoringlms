package com.ims.reports.util;

import java.math.BigDecimal;

public class NumberToWords {

    private static final String[] units = {
        "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
        "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen",
        "Eighteen", "Nineteen"
    };

    private static final String[] tens = {
        "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"
    };

    public static String convert(BigDecimal amount) {
        if (amount == null) return "Zero Only";
        
        long number = amount.longValue();
        if (number == 0) return "Zero Only";

        String words = convertRecursive(number);
        return words.trim() + " Only";
    }

    private static String convertRecursive(long n) {
        if (n < 20) return units[(int) n];
        if (n < 100) return tens[(int) (n / 10)] + " " + units[(int) (n % 10)];
        if (n < 1000) return units[(int) (n / 100)] + " Hundred " + convertRecursive(n % 100);
        if (n < 100000) return convertRecursive(n / 1000) + " Thousand " + convertRecursive(n % 1000);
        if (n < 10000000) return convertRecursive(n / 100000) + " Lakh " + convertRecursive(n % 100000);
        
        return convertRecursive(n / 10000000) + " Crore " + convertRecursive(n % 10000000);
    }
}
