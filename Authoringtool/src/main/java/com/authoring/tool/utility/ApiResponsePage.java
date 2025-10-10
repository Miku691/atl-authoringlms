package com.authoring.tool.utility;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ApiResponsePage<T> {
    private List<T> content;
    private Long totalElement;
    private int totalPage;
    private int currentPage;
    private boolean isFirst;
    private boolean isLast;
}