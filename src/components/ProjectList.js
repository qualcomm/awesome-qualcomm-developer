// Copyright (c) Qualcomm Technologies, Inc. and/or its subsidiaries.
// SPDX-License-Identifier: BSD-3-Clause

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import ProjectCard from './ProjectCard';
import ProjectFilter from './ProjectFilter';

const sortProjects = (projects, criteria, direction) => {
    const sorted = [...projects];
    sorted.sort((a, b) => {
        let valA, valB;
        switch (criteria) {
            case 'name':
                valA = a.name.toLowerCase();
                valB = b.name.toLowerCase();
                break;
            case 'stars':
                valA = a.stars || 0;
                valB = b.stars || 0;
                break;
            case 'author':
                valA = a.author.toLowerCase();
                valB = b.author.toLowerCase();
                break;
            case 'lastUpdated':
            default:
                valA = new Date(a.lastUpdated);
                valB = new Date(b.lastUpdated);
                break;
        }
        if (valA < valB) return direction === 'asc' ? -1 : 1;
        if (valA > valB) return direction === 'asc' ? 1 : -1;
        return 0;
    });
    return sorted;
};

const ProjectList = ({ projects }) => {
    const [searchParams] = useSearchParams();
    const [filteredProjects, setFilteredProjects] = useState(projects);

    const platformFilter = searchParams.get('platform');
    const categoryFilter = searchParams.get('category');
    const searchTerm = searchParams.get('search'); // Basic search from a URL param
    const sortCriteria = searchParams.get('sort') || 'lastUpdated';
    const sortDirection = searchParams.get('direction') || 'desc';

    useEffect(() => {
        let tempProjects = [...projects];

        if (platformFilter) {
            tempProjects = tempProjects.filter(p => p.platforms.includes(platformFilter));
        }

        if (categoryFilter) {
            tempProjects = tempProjects.filter(p => p.categories.includes(categoryFilter));
        }

        if (searchTerm) {
            tempProjects = tempProjects.filter(p =>
                p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.description.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        tempProjects = sortProjects(tempProjects, sortCriteria, sortDirection);

        setFilteredProjects(tempProjects);
    }, [projects, platformFilter, categoryFilter, searchTerm, sortCriteria, sortDirection]);

    return (
        <>
            <ProjectFilter allProjects={projects} />
            <Row>
                {filteredProjects.length > 0 ? (
                    filteredProjects.map(project => (
                        <ProjectCard key={project.name} project={project} />
                    ))
                ) : (
                    <Col md={12}>
                        <div className="alert alert-warning text-center" role="alert">
                            No projects found.
                        </div>
                    </Col>
                )}
            </Row>
        </>
    );
};

export default ProjectList;