package com.ims.finance.service.impl;

import com.ims.finance.dto.FeeDiscountDTO;
import com.ims.finance.entity.FeeDiscount;
import com.ims.finance.exception.ResourceNotFoundException;
import com.ims.finance.repository.FeeDiscountRepository;
import com.ims.finance.service.FeeDiscountService;
import com.ims.finance.util.SecurityUtils;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Implementation of FeeDiscountService.
 */
@Service
public class FeeDiscountServiceImpl implements FeeDiscountService {

    private final FeeDiscountRepository feeDiscountRepository;
    private final ModelMapper modelMapper;

    public FeeDiscountServiceImpl(FeeDiscountRepository feeDiscountRepository, ModelMapper modelMapper) {
        this.feeDiscountRepository = feeDiscountRepository;
        this.modelMapper = modelMapper;
    }

    @Override
    public FeeDiscountDTO createFeeDiscount(FeeDiscountDTO feeDiscountDTO) {
        FeeDiscount discount = modelMapper.map(feeDiscountDTO, FeeDiscount.class);
        discount.setTenantId(SecurityUtils.getCurrentTenantId());
        FeeDiscount saved = feeDiscountRepository.save(discount);
        return modelMapper.map(saved, FeeDiscountDTO.class);
    }

    @Override
    public List<FeeDiscountDTO> getAllFeeDiscounts() {
        String tenantId = SecurityUtils.getCurrentTenantId();
        return feeDiscountRepository.findAllByTenantId(tenantId).stream()
                .map(fd -> modelMapper.map(fd, FeeDiscountDTO.class))
                .collect(Collectors.toList());
    }

    @Override
    public FeeDiscountDTO getFeeDiscountById(String id) {
        FeeDiscount feeDiscount = feeDiscountRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("id", id));
        return modelMapper.map(feeDiscount, FeeDiscountDTO.class);
    }

    @Override
    public FeeDiscountDTO updateFeeDiscount(String id, FeeDiscountDTO feeDiscountDTO) {
        FeeDiscount feeDiscount = feeDiscountRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("id", id));

        feeDiscount.setName(feeDiscountDTO.getName());
        feeDiscount.setType(FeeDiscount.DiscountType.valueOf(feeDiscountDTO.getType()));
        feeDiscount.setValue(feeDiscountDTO.getValue());

        FeeDiscount updatedFeeDiscount = feeDiscountRepository.save(feeDiscount);
        return modelMapper.map(updatedFeeDiscount, FeeDiscountDTO.class);
    }

    @Override
    public void deleteFeeDiscount(String id) {
        FeeDiscount feeDiscount = feeDiscountRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("id", id));
        feeDiscountRepository.delete(feeDiscount);
    }
}
