package com.attus.api.validation;

public final class ProdutoConstraints {
    public static final int NAME_MAX_LENGTH = 150;
    public static final int DESCRIPTION_MAX_LENGTH = 5000;
    public static final int PRICE_INTEGER_DIGITS = 8;
    public static final int PRICE_FRACTION_DIGITS = 2;

    private ProdutoConstraints() {
    }
}
