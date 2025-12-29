package com.atl.gateway.utility;

import com.atl.gateway.dto.AtlErrorResponseDTO;
import org.springframework.boot.autoconfigure.web.WebProperties;
import org.springframework.boot.autoconfigure.web.reactive.error.AbstractErrorWebExceptionHandler;
import org.springframework.boot.web.reactive.error.ErrorAttributes;
import org.springframework.context.ApplicationContext;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.codec.ServerCodecConfigurer;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.server.*;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;

@Component
@Order(-2)
public class JwtGlobalErrorHandler extends AbstractErrorWebExceptionHandler {
    public JwtGlobalErrorHandler(ErrorAttributes errorAttributes,
                              WebProperties webProperties,
                              ApplicationContext applicationContext,
                              ServerCodecConfigurer codecConfigurer) {
        super(errorAttributes, webProperties.getResources(), applicationContext);
        super.setMessageWriters(codecConfigurer.getWriters());
        super.setMessageReaders(codecConfigurer.getReaders());
    }

    @Override
    public RouterFunction<ServerResponse> getRoutingFunction(ErrorAttributes errorAttributes) {
        return RouterFunctions.route(RequestPredicates.all(), this::renderErrorResponse);
    }

    protected Mono<ServerResponse> renderErrorResponse(ServerRequest request) {
        Throwable error = getError(request);

        HttpStatus status = HttpStatus.INTERNAL_SERVER_ERROR;
        String message = "Unexpected error";

        if (error instanceof io.jsonwebtoken.security.SignatureException) {
            status = HttpStatus.UNAUTHORIZED;
            message = "Invalid JWT signature";
        }else if (error instanceof io.jsonwebtoken.ExpiredJwtException) {
            status = HttpStatus.UNAUTHORIZED;
            message = "JWT token has expired";
        }else if(error instanceof JwtUnauthorizedException){
            status = HttpStatus.UNAUTHORIZED;
            message = error.getMessage();
        }

        AtlErrorResponseDTO response = new AtlErrorResponseDTO(
                status.value(),
                status.getReasonPhrase(),
                message,
                request.path(),
                LocalDateTime.now().toString()
        );

        return ServerResponse.status(status)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(response);
    }


}
