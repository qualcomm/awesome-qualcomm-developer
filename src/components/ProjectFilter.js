// Copyright (c) Qualcomm Technologies, Inc. and/or its subsidiaries.
// SPDX-License-Identifier: BSD-3-Clause

import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Button from 'react-bootstrap/Button';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'

library.add(fas)

const ProjectFilter = ({ allProjects }) => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const currentPlatforms = searchParams.getAll('platform');
    const currentCategories = searchParams.getAll('category'); // getAll for multiple
    const [searchTerm, setSearchTerm] = useState('');
    const sortCriteria = searchParams.get('sort') || 'lastUpdated';
    const sortDirection = searchParams.get('direction') || 'desc';

    const allPlatforms = [...new Set(allProjects.flatMap(p => p.platforms))].sort();
    const allCategories = [...new Set(allProjects.flatMap(p => p.categories))].sort();

    useEffect(() => {
        // This effect is useful if you want to perform an action on filter change
    }, [currentPlatforms, currentCategories]);

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    // Helper to update all filters and sort in URL
    const updateFilter = (platforms, categories, search = searchTerm, sort = sortCriteria, direction = sortDirection) => {
        const params = new URLSearchParams();
        platforms.forEach(plat => params.append('platform', plat));
        categories.forEach(cat => params.append('category', cat));
        if (search) params.set('search', search);
        params.set('sort', sort);
        params.set('direction', direction);
        navigate(`/?${params.toString()}`);
    };

    // Toggle platform selection
    const handlePlatformToggle = (platform) => {
        let newPlatforms;
        if (currentPlatforms.includes(platform)) {
            newPlatforms = currentPlatforms.filter(plat => plat !== platform);
        } else {
            newPlatforms = [...currentPlatforms, platform];
        }
        updateFilter(newPlatforms, currentCategories);
    };

    // Clear all platforms
    const handleClearPlatforms = () => {
        updateFilter([], currentCategories);
    };

    // Toggle category selection
    const handleCategoryToggle = (category) => {
        let newCategories;
        if (currentCategories.includes(category)) {
            newCategories = currentCategories.filter(cat => cat !== category);
        } else {
            newCategories = [...currentCategories, category];
        }
        updateFilter(currentPlatforms, newCategories);
    };

    // Clear all categories
    const handleClearCategories = () => {
        updateFilter(currentPlatforms, []);
    };

    const handleClearSearch = () => {
        setSearchTerm('');
        updateFilter(currentPlatforms, currentCategories, '', sortCriteria, sortDirection);
    };

    return (
        <>
            <Row className="mb-4 px-2">
                <Col md={12} className="p-3 shadow-sm border rounded">
                    <Row className="mb-3">
                        <Col md={8}>
                            <h5 className="fw-bold"><FontAwesomeIcon icon="fa-solid fa-magnifying-glass" /> Search</h5>
                            <Form>
                                <InputGroup>
                                    <Form.Control
                                        type="text"
                                        placeholder="Name, description, author..."
                                        value={searchTerm}
                                        onChange={handleSearchChange}
                                    />
                                    <Button
                                        type="submit"
                                        variant="primary"
                                        onClick={(e) => { e.preventDefault(); updateFilter(currentPlatforms, currentCategories, searchTerm); }}
                                    >
                                        <FontAwesomeIcon icon="fa-solid fa-magnifying-glass" />
                                    </Button>
                                    {searchTerm && (
                                        <Button
                                            type="button"
                                            variant="outline-secondary"
                                            onClick={handleClearSearch}
                                        >
                                            <FontAwesomeIcon icon="fa-solid fa-circle-xmark" />
                                        </Button>
                                    )}
                                </InputGroup>
                            </Form>
                        </Col>
                        <Col md={4} className="sort-controls">
                            <h5 className="fw-bold"><FontAwesomeIcon icon="fa-solid fa-arrow-down-wide-short" /> Sort</h5>
                            <Row>
                                <Col>
                                    <Form.Select
                                        aria-label="Sort criteria"
                                        size="sm"
                                        className="mb-3"
                                        value={sortCriteria}
                                        onChange={e => updateFilter(currentPlatforms, currentCategories, searchTerm, e.target.value, sortDirection)}
                                    >
                                        <option value="lastUpdated">Last Updated</option>
                                        <option value="name">Name</option>
                                        <option value="stars">Stars</option>
                                        <option value="author">Author</option>
                                    </Form.Select>
                                </Col>
                                <Col>
                                    <Form.Select
                                        aria-label="Sort direction"
                                        size="sm"
                                        className="mb-3"
                                        value={sortDirection}
                                        onChange={e => updateFilter(currentPlatforms, currentCategories, searchTerm, sortCriteria, e.target.value)}
                                    >
                                        <option value="desc">Descending</option>
                                        <option value="asc">Ascending</option>
                                    </Form.Select>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                    <Row className="mb-3">
                        <Col>
                            <h5 className="fw-bold"><FontAwesomeIcon icon="fa-solid fa-microchip" /> Platforms</h5>
                            {allPlatforms.map(platform => (
                                <Button
                                    key={platform}
                                    type="button"
                                    variant={currentPlatforms.includes(platform) ? 'primary' : 'outline-primary'}
                                    size="sm"
                                    className="me-2 mb-2"
                                    onClick={() => handlePlatformToggle(platform)}
                                >
                                    {platform}
                                </Button>
                            ))}
                            {currentPlatforms.length > 0 && (
                                <button
                                    type="button"
                                    className="btn btn-sm btn-outline-danger me-2 mb-2"
                                    onClick={handleClearPlatforms}
                                >
                                    Clear Platform
                                </button>
                            )}
                        </Col>
                    </Row>
                    <Row className="mb-3">
                        <Col>
                            <h5 className="fw-bold"><FontAwesomeIcon icon="fa-solid fa-list-check" /> Categories</h5>
                            {allCategories.map(category => (
                                <Button
                                    key={category}
                                    type="button"
                                    variant={currentCategories.includes(category) ? 'info' : 'outline-info'}
                                    size="sm"
                                    className="me-2 mb-2"
                                    onClick={() => handleCategoryToggle(category)}
                                >
                                    {category}
                                </Button>
                            ))}
                            {currentCategories.length > 0 && (
                                <Button
                                    type="button"
                                    variant="outline-danger"
                                    size="sm"
                                    className="me-2 mb-2"
                                    onClick={handleClearCategories}
                                >
                                    Clear Categories
                                </Button>
                            )}
                        </Col>
                    </Row>
                </Col>
            </Row>
        </>
    );
};

export default ProjectFilter;